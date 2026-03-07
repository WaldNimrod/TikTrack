-- G7 M-008: Extend condition_operator for crosses_above/crosses_below (13 chars)
-- Phase C: Alert condition builder backend contract

ALTER TABLE user_data.alerts
  ALTER COLUMN condition_operator TYPE VARCHAR(20);

COMMENT ON COLUMN user_data.alerts.condition_operator IS 'Canonical: >|<|>=|<=|=|crosses_above|crosses_below';
