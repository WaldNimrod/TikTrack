import pytest
import time
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from models.currency import Currency
from models.account import Account
from models.ticker import Ticker
from models.cash_flow import CashFlow


class TestCurrencyPerformance:
    """Performance tests for currency operations with joins"""
    
    def test_currency_joins_performance(self, db_session: Session):
        """Test performance of currency joins with large datasets"""
        # Create multiple currencies
        currencies = []
        for i in range(10):
            currency = Currency(
                symbol=f"CUR{i:03d}",
                name=f"Currency {i}",
                usd_rate=Decimal(f"{1.0 + i * 0.1:.6f}")
            )
            currencies.append(currency)
        
        db_session.add_all(currencies)
        db_session.commit()
        
        # Create accounts for each currency
        accounts = []
        for i, currency in enumerate(currencies):
            for j in range(5):  # 5 accounts per currency
                account = Account(
                    name=f"Account {i}-{j}",
                    currency_id=currency.id,
                    status="active"
                )
                accounts.append(account)
        
        db_session.add_all(accounts)
        db_session.commit()
        
        # Create tickers for each currency
        tickers = []
        for i, currency in enumerate(currencies):
            for j in range(3):  # 3 tickers per currency
                ticker = Ticker(
                    symbol=f"TICK{i:03d}{j}",
                    name=f"Ticker {i}-{j}",
                    type="stock",
                    currency_id=currency.id
                )
                tickers.append(ticker)
        
        db_session.add_all(tickers)
        db_session.commit()
        
        # Test performance of different query approaches
        
        # 1. Simple query without joins
        start_time = time.time()
        accounts_simple = db_session.query(Account).all()
        simple_time = time.time() - start_time
        
        # 2. Query with currency join
        start_time = time.time()
        accounts_with_currency = db_session.query(Account).options(
            joinedload(Account.currency)
        ).all()
        join_time = time.time() - start_time
        
        # 3. Query with all relationships
        start_time = time.time()
        accounts_full = db_session.query(Account).options(
            joinedload(Account.currency),
            joinedload(Account.trades),
            joinedload(Account.cash_flows)
        ).all()
        full_join_time = time.time() - start_time
        
        # Verify data integrity
        assert len(accounts_simple) == 50  # 10 currencies * 5 accounts
        assert len(accounts_with_currency) == 50
        assert len(accounts_full) == 50
        
        # Check that joins work correctly
        for account in accounts_with_currency:
            assert account.currency is not None
            assert account.currency.symbol.startswith("CUR")
        
        # Performance assertions (should be reasonable)
        assert simple_time < 1.0  # Should be fast
        assert join_time < 2.0    # Join should be reasonable
        assert full_join_time < 3.0  # Full join should be reasonable
        
        print(f"Simple query: {simple_time:.3f}s")
        print(f"With currency join: {join_time:.3f}s")
        print(f"Full joins: {full_join_time:.3f}s")
    
    def test_currency_filtering_performance(self, db_session: Session):
        """Test performance of filtering by currency"""
        # Create test data
        usd = Currency(symbol="USD", name="US Dollar", usd_rate=Decimal('1.000000'))
        eur = Currency(symbol="EUR", name="Euro", usd_rate=Decimal('0.850000'))
        ils = Currency(symbol="ILS", name="Israeli Shekel", usd_rate=Decimal('3.650000'))
        
        db_session.add_all([usd, eur, ils])
        db_session.commit()
        
        # Create accounts for each currency
        accounts = []
        for i in range(20):  # 20 accounts per currency
            currency = [usd, eur, ils][i % 3]
            account = Account(
                name=f"חשבון {currency.symbol}-{i}",
                currency_id=currency.id,
                status="active"
            )
        
        db_session.add_all(accounts)
        db_session.commit()
        
        # Test filtering performance
        start_time = time.time()
        usd_accounts = db_session.query(Account).filter(
            Account.currency_id == usd.id
        ).all()
        usd_filter_time = time.time() - start_time
        
        start_time = time.time()
        usd_accounts_with_currency = db_session.query(Account).options(
            joinedload(Account.currency)
        ).filter(
            Account.currency_id == usd.id
        ).all()
        usd_filter_join_time = time.time() - start_time
        
        # Test filtering by currency symbol
        start_time = time.time()
        usd_accounts_by_symbol = db_session.query(Account).join(
            Account.currency
        ).filter(
            Currency.symbol == "USD"
        ).all()
        symbol_filter_time = time.time() - start_time
        
        # Verify results
        assert len(usd_accounts) == 7  # 20 accounts, 3 currencies = ~7 per currency
        assert len(usd_accounts_with_currency) == 7
        assert len(usd_accounts_by_symbol) == 7
        
        # Performance assertions
        assert usd_filter_time < 0.1
        assert usd_filter_join_time < 0.2
        assert symbol_filter_time < 0.2
        
        print(f"USD filter: {usd_filter_time:.3f}s")
        print(f"USD filter with join: {usd_filter_join_time:.3f}s")
        print(f"Symbol filter: {symbol_filter_time:.3f}s")
    
    def test_currency_aggregation_performance(self, db_session: Session):
        """Test performance of currency aggregations"""
        from sqlalchemy import func
        
        # Create test data
        currencies = []
        for i in range(5):
            currency = Currency(
                symbol=f"CUR{i}",
                name=f"מטבע {i}",
                usd_rate=Decimal(f"{1.0 + i * 0.1:.6f}")
            )
            currencies.append(currency)
        
        db_session.add_all(currencies)
        db_session.commit()
        
        # Create accounts with different balances
        accounts = []
        for i, currency in enumerate(currencies):
            for j in range(10):
                account = Account(
                    name=f"חשבון {i}-{j}",
                    currency_id=currency.id,
                    status="active",
                    cash_balance=1000.0 + (i * 100) + j
                )
                accounts.append(account)
        
        db_session.add_all(accounts)
        db_session.commit()
        
        # Test aggregation performance
        start_time = time.time()
        currency_stats = db_session.query(
            Currency.symbol,
            func.count(Account.id).label('account_count'),
            func.sum(Account.cash_balance).label('total_balance')
        ).join(Account).group_by(Currency.id, Currency.symbol).all()
        aggregation_time = time.time() - start_time
        
        # Test complex aggregation with multiple joins
        start_time = time.time()
        detailed_stats = db_session.query(
            Currency.symbol,
            Currency.name,
            func.count(Account.id).label('accounts'),
            func.count(Ticker.id).label('tickers'),
            func.avg(Account.cash_balance).label('avg_balance')
        ).outerjoin(Account).outerjoin(Ticker).group_by(
            Currency.id, Currency.symbol, Currency.name
        ).all()
        complex_aggregation_time = time.time() - start_time
        
        # Verify results
        assert len(currency_stats) == 5
        assert len(detailed_stats) == 5
        
        # Performance assertions
        assert aggregation_time < 0.5
        assert complex_aggregation_time < 1.0
        
        print(f"Simple aggregation: {aggregation_time:.3f}s")
        print(f"Complex aggregation: {complex_aggregation_time:.3f}s")
    
    def test_currency_bulk_operations_performance(self, db_session: Session):
        """Test performance of bulk currency operations"""
        # Test bulk insert
        start_time = time.time()
        currencies = []
        for i in range(100):
            currency = Currency(
                symbol=f"BULK{i:03d}",
                name=f"מטבע Bulk {i}",
                usd_rate=Decimal(f"{1.0 + i * 0.01:.6f}")
            )
            currencies.append(currency)
        
        db_session.add_all(currencies)
        db_session.commit()
        bulk_insert_time = time.time() - start_time
        
        # Test bulk update
        start_time = time.time()
        for currency in currencies:
            currency.usd_rate = currency.usd_rate * Decimal('1.1')
        
        db_session.commit()
        bulk_update_time = time.time() - start_time
        
        # Test bulk delete
        start_time = time.time()
        db_session.query(Currency).filter(
            Currency.symbol.like("BULK%")
        ).delete(synchronize_session=False)
        db_session.commit()
        bulk_delete_time = time.time() - start_time
        
        # Performance assertions
        assert bulk_insert_time < 2.0
        assert bulk_update_time < 1.0
        assert bulk_delete_time < 1.0
        
        print(f"Bulk insert (100 currencies): {bulk_insert_time:.3f}s")
        print(f"Bulk update: {bulk_update_time:.3f}s")
        print(f"Bulk delete: {bulk_delete_time:.3f}s")
    
    def test_currency_memory_usage(self, db_session: Session):
        """Test memory usage with currency joins"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Create large dataset
        currencies = []
        for i in range(50):
            currency = Currency(
                symbol=f"MEM{i:03d}",
                name=f"מטבע Memory {i}",
                usd_rate=Decimal(f"{1.0 + i * 0.01:.6f}")
            )
            currencies.append(currency)
        
        db_session.add_all(currencies)
        db_session.commit()
        
        # Create accounts with currency joins
        accounts = []
        for i, currency in enumerate(currencies):
            for j in range(5):
                account = Account(
                    name=f"חשבון Memory {i}-{j}",
                    currency_id=currency.id,
                    status="active"
                )
                accounts.append(account)
        
        db_session.add_all(accounts)
        db_session.commit()
        
        # Load all accounts with currency joins
        accounts_with_currency = db_session.query(Account).options(
            joinedload(Account.currency)
        ).all()
        
        # Get memory usage after loading
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Verify data
        assert len(accounts_with_currency) == 250  # 50 currencies * 5 accounts
        
        # Memory usage should be reasonable (less than 100MB increase)
        assert memory_increase < 100
        
        print(f"Initial memory: {initial_memory:.1f} MB")
        print(f"Final memory: {final_memory:.1f} MB")
        print(f"Memory increase: {memory_increase:.1f} MB")
        print(f"Accounts loaded: {len(accounts_with_currency)}")
