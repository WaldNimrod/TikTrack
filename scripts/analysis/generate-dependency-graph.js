#!/usr/bin/env node

/**
 * Generate Dependency Graph - TikTrack
 * =====================================
 * 
 * יצירת גרף תלויות ויזואלי (JSON, Mermaid, DOT)
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    scanResultsFile: 'reports/integration-analysis/integration-scan-results.json',
    outputDir: 'reports/integration-analysis'
};

class DependencyGraphGenerator {
    constructor() {
        this.scanResults = null;
        this.graph = {
            nodes: [],
            edges: [],
            cycles: []
        };
    }

    /**
     * Load scan results
     */
    loadScanResults() {
        const resultsPath = path.join(process.cwd(), CONFIG.scanResultsFile);
        
        if (!fs.existsSync(resultsPath)) {
            throw new Error('Scan results not found. Run system-integration-scanner.js first.');
        }
        
        this.scanResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
        return this.scanResults;
    }

    /**
     * Generate graph from scan results
     */
    generateGraph() {
        if (!this.scanResults || !this.scanResults.dependencyGraph) {
            throw new Error('No dependency graph in scan results');
        }
        
        this.graph = {
            ...this.scanResults.dependencyGraph,
            cycles: this.scanResults.circularDependencies || []
        };
        
        // Enhance nodes with metadata
        if (this.scanResults.systems) {
            this.graph.nodes = this.graph.nodes.map(node => {
                const systemData = this.scanResults.systems[node.id];
                return {
                    ...node,
                    totalDependencies: systemData?.totalDependencies || 0,
                    file: systemData?.file || node.file
                };
            });
        }
        
        return this.graph;
    }

    /**
     * Generate Mermaid diagram
     */
    generateMermaid() {
        let mermaid = `graph TD\n`;
        
        // Create nodes
        this.graph.nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id);
            const label = node.id;
            const typeClass = this.getNodeClass(node.type);
            
            mermaid += `    ${nodeId}[${label}]\n`;
            mermaid += `    classDef ${typeClass} fill:#${this.getNodeColor(node.type)},stroke:#333,stroke-width:2px\n`;
        });
        
        // Create edges
        this.graph.edges.forEach(edge => {
            const fromId = this.sanitizeId(edge.from);
            const toId = this.sanitizeId(edge.to);
            mermaid += `    ${fromId}-->${toId}\n`;
        });
        
        // Apply classes
        this.graph.nodes.forEach(node => {
            const nodeId = this.sanitizeId(node.id);
            const typeClass = this.getNodeClass(node.type);
            mermaid += `    class ${nodeId} ${typeClass}\n`;
        });
        
        return mermaid;
    }

    /**
     * Generate DOT format (Graphviz)
     */
    generateDOT() {
        let dot = `digraph TikTrackIntegration {\n`;
        dot += `    rankdir=LR;\n`;
        dot += `    node [shape=box, style=rounded];\n\n`;
        
        // Group by type
        const nodesByType = {};
        this.graph.nodes.forEach(node => {
            const type = node.type || 'Unknown';
            if (!nodesByType[type]) {
                nodesByType[type] = [];
            }
            nodesByType[type].push(node);
        });
        
        // Create subgraphs by type
        Object.entries(nodesByType).forEach(([type, nodes]) => {
            dot += `    subgraph cluster_${this.sanitizeId(type)} {\n`;
            dot += `        label="${type}";\n`;
            dot += `        style=dashed;\n\n`;
            
            nodes.forEach(node => {
                const nodeId = this.sanitizeId(node.id);
                dot += `        ${nodeId}[label="${node.id}"];\n`;
            });
            
            dot += `    }\n\n`;
        });
        
        // Create edges
        this.graph.edges.forEach(edge => {
            const fromId = this.sanitizeId(edge.from);
            const toId = this.sanitizeId(edge.to);
            dot += `    ${fromId} -> ${toId};\n`;
        });
        
        // Highlight cycles
        if (this.graph.cycles && this.graph.cycles.length > 0) {
            dot += `\n    // Circular dependencies\n`;
            this.graph.cycles.forEach(cycle => {
                for (let i = 0; i < cycle.length - 1; i++) {
                    const fromId = this.sanitizeId(cycle[i]);
                    const toId = this.sanitizeId(cycle[i + 1]);
                    dot += `    ${fromId} -> ${toId} [color=red, style=bold];\n`;
                }
            });
        }
        
        dot += `}\n`;
        
        return dot;
    }

    /**
     * Generate ASCII graph
     */
    generateASCII() {
        let ascii = `TikTrack Integration Dependency Graph\n`;
        ascii += `=====================================\n\n`;
        
        // Group by dependency count
        const sortedNodes = [...this.graph.nodes].sort((a, b) => 
            (b.totalDependencies || 0) - (a.totalDependencies || 0)
        );
        
        ascii += `Systems (sorted by dependency count):\n`;
        ascii += `-------------------------------------\n`;
        
        sortedNodes.forEach((node, index) => {
            const deps = this.graph.edges.filter(e => e.from === node.id).length;
            const usedBy = this.graph.edges.filter(e => e.to === node.id).length;
            
            ascii += `${index + 1}. ${node.id}\n`;
            ascii += `   Type: ${node.type || 'Unknown'}\n`;
            ascii += `   Dependencies: ${deps}\n`;
            ascii += `   Used by: ${usedBy}\n`;
            ascii += `   File: ${node.file || 'N/A'}\n\n`;
        });
        
        // Show critical paths
        ascii += `Critical Paths:\n`;
        ascii += `---------------\n`;
        
        const criticalPaths = this.findCriticalPaths();
        criticalPaths.slice(0, 10).forEach((path, index) => {
            ascii += `${index + 1}. ${path.join(' -> ')}\n`;
        });
        
        // Show cycles
        if (this.graph.cycles && this.graph.cycles.length > 0) {
            ascii += `\nCircular Dependencies:\n`;
            ascii += `----------------------\n`;
            this.graph.cycles.forEach((cycle, index) => {
                ascii += `${index + 1}. ${cycle.join(' -> ')} -> ${cycle[0]}\n`;
            });
        }
        
        return ascii;
    }

    /**
     * Find critical paths (longest dependency chains)
     */
    findCriticalPaths() {
        const paths = [];
        const visited = new Set();
        
        const dfs = (node, path = []) => {
            if (path.includes(node)) {
                // Cycle detected
                return;
            }
            
            const newPath = [...path, node];
            
            // Find outgoing edges
            const outgoing = this.graph.edges.filter(e => e.from === node);
            
            if (outgoing.length === 0) {
                // Leaf node - save path
                paths.push(newPath);
            } else {
                outgoing.forEach(edge => {
                    dfs(edge.to, newPath);
                });
            }
        };
        
        // Start from nodes with no incoming edges
        const rootNodes = this.graph.nodes.filter(node => {
            return !this.graph.edges.some(e => e.to === node.id);
        });
        
        rootNodes.forEach(root => {
            dfs(root.id);
        });
        
        // Sort by length (longest first)
        return paths.sort((a, b) => b.length - a.length);
    }

    /**
     * Save all graph formats
     */
    saveGraphs() {
        const outputDir = path.join(process.cwd(), CONFIG.outputDir);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save JSON
        const jsonFile = path.join(outputDir, 'dependency-graph.json');
        fs.writeFileSync(jsonFile, JSON.stringify(this.graph, null, 2));
        console.log(`💾 JSON graph saved to: ${jsonFile}`);
        
        // Save Mermaid
        const mermaidFile = path.join(outputDir, 'dependency-graph.mmd');
        fs.writeFileSync(mermaidFile, this.generateMermaid());
        console.log(`💾 Mermaid graph saved to: ${mermaidFile}`);
        
        // Save DOT
        const dotFile = path.join(outputDir, 'dependency-graph.dot');
        fs.writeFileSync(dotFile, this.generateDOT());
        console.log(`💾 DOT graph saved to: ${dotFile}`);
        
        // Save ASCII
        const asciiFile = path.join(outputDir, 'dependency-graph.txt');
        fs.writeFileSync(asciiFile, this.generateASCII());
        console.log(`💾 ASCII graph saved to: ${asciiFile}`);
        
        return {
            json: jsonFile,
            mermaid: mermaidFile,
            dot: dotFile,
            ascii: asciiFile
        };
    }

    /**
     * Helper: Sanitize ID for graph formats
     */
    sanitizeId(id) {
        return id.replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * Helper: Get node class name
     */
    getNodeClass(type) {
        const classMap = {
            'Service': 'service',
            'Manager': 'manager',
            'System': 'system',
            'EntityService': 'entity',
            'Modal': 'modal',
            'Renderer': 'renderer',
            'API': 'api',
            'Utility': 'utility',
            'Function': 'function'
        };
        return classMap[type] || 'unknown';
    }

    /**
     * Helper: Get node color by type
     */
    getNodeColor(type) {
        const colorMap = {
            'Service': 'e1f5fe',
            'Manager': 'f3e5f5',
            'System': 'e8f5e9',
            'EntityService': 'fff3e0',
            'Modal': 'fce4ec',
            'Renderer': 'e0f2f1',
            'API': 'fff9c4',
            'Utility': 'f1f8e9',
            'Function': 'e3f2fd'
        };
        return colorMap[type] || 'f5f5f5';
    }
}

// Main execution
if (require.main === module) {
    const generator = new DependencyGraphGenerator();
    
    generator.loadScanResults();
    generator.generateGraph();
    generator.saveGraphs();
    
    console.log('\n✅ Dependency graphs generated!');
    console.log(`📊 Graph contains ${generator.graph.nodes.length} nodes and ${generator.graph.edges.length} edges`);
    
    if (generator.graph.cycles && generator.graph.cycles.length > 0) {
        console.log(`⚠️  Found ${generator.graph.cycles.length} circular dependencies`);
    }
}

module.exports = DependencyGraphGenerator;


