"""
Unit tests for TemporalQueryParser.
"""

import sys
from pathlib import Path

# Add scripts to path
_project_root = Path(__file__).parent.parent.parent
_scripts = _project_root / "scripts"
if str(_scripts) not in sys.path:
    sys.path.insert(0, str(_scripts))

import pytest
from datetime import datetime, timedelta

from graphiti_client import TemporalQueryParser, TimeFilter


class TestTemporalQueryParser:
    """Test temporal query parsing."""
    
    def test_last_n_days(self):
        parser = TemporalQueryParser()
        result = parser.parse("last 7 days")
        assert result.start_date is not None
        assert result.end_date is not None
        assert (result.end_date - result.start_date).days == 7
    
    def test_last_n_weeks(self):
        parser = TemporalQueryParser()
        result = parser.parse("last 2 weeks")
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 14
    
    def test_last_week(self):
        parser = TemporalQueryParser()
        result = parser.parse("last week")
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 7
    
    def test_last_month(self):
        parser = TemporalQueryParser()
        result = parser.parse("last month")
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 30
    
    def test_month_year(self):
        parser = TemporalQueryParser()
        result = parser.parse("in April 2026")
        assert result.start_date is not None
        assert result.start_date.year == 2026
        assert result.start_date.month == 4
    
    def test_year_month_format(self):
        parser = TemporalQueryParser()
        result = parser.parse("2026-04")
        assert result.start_date is not None
        assert result.start_date.year == 2026
        assert result.start_date.month == 4
    
    def test_case_insensitive(self):
        parser = TemporalQueryParser()
        result1 = parser.parse("LAST 7 DAYS")
        result2 = parser.parse("Last 7 Days")
        diff = abs((result1.start_date - result2.start_date).total_seconds())
        assert diff < 1
    
    def test_default_last_7_days(self):
        parser = TemporalQueryParser()
        result = parser.parse("random text")
        assert (result.end_date - result.start_date).days == 7


class TestTimeFilter:
    def test_to_dict_with_dates(self):
        tf = TimeFilter(start_date=datetime(2026, 4, 1), end_date=datetime(2026, 4, 30))
        result = tf.to_dict()
        assert result["start_date"] == "2026-04-01T00:00:00"
        assert result["end_date"] == "2026-04-30T00:00:00"
    
    def test_to_dict_with_none(self):
        tf = TimeFilter(start_date=datetime(2026, 4, 1))
        result = tf.to_dict()
        assert result["start_date"] is not None
        assert result["end_date"] is None


class TestTimeFilterDateCalculation:
    def test_today_reference(self):
        parser = TemporalQueryParser()
        result = parser.parse("last 1 days")
        now = datetime.now()
        diff = abs((result.end_date - now).total_seconds())
        assert diff < 60
