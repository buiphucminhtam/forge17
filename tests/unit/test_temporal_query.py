"""
Unit tests for TemporalQueryParser.

Tests natural language time expression parsing.
"""

import pytest
from datetime import datetime, timedelta

from graphiti_client import TemporalQueryParser, TimeFilter


class TestTemporalQueryParser:
    """Test temporal query parsing."""
    
    def test_last_n_days(self):
        """Test 'last N days' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("last 7 days")
        
        assert result.start_date is not None
        assert result.end_date is not None
        assert (result.end_date - result.start_date).days == 7
    
    def test_last_n_weeks(self):
        """Test 'last N weeks' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("last 2 weeks")
        
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 14
    
    def test_last_week(self):
        """Test 'last week' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("last week")
        
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 7
    
    def test_last_month(self):
        """Test 'last month' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("last month")
        
        assert result.start_date is not None
        assert (result.end_date - result.start_date).days == 30
    
    def test_month_year(self):
        """Test 'in Month YYYY' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("in April 2026")
        
        assert result.start_date is not None
        assert result.start_date.year == 2026
        assert result.start_date.month == 4
        assert result.start_date.day == 1
    
    def test_year_month_format(self):
        """Test 'YYYY-MM' pattern."""
        parser = TemporalQueryParser()
        result = parser.parse("2026-04")
        
        assert result.start_date is not None
        assert result.start_date.year == 2026
        assert result.start_date.month == 4
    
    def test_case_insensitive(self):
        """Test case insensitivity."""
        parser = TemporalQueryParser()
        result1 = parser.parse("LAST 7 DAYS")
        result2 = parser.parse("Last 7 Days")

        # Same day range (allow for microsecond differences)
        diff = abs((result1.start_date - result2.start_date).total_seconds())
        assert diff < 1  # Within 1 second
    
    def test_default_last_7_days(self):
        """Test default behavior when no pattern matches."""
        parser = TemporalQueryParser()
        result = parser.parse("random text")
        
        # Should default to last 7 days
        assert (result.end_date - result.start_date).days == 7


class TestTimeFilter:
    """Test TimeFilter dataclass."""
    
    def test_to_dict_with_dates(self):
        """Test TimeFilter serialization."""
        tf = TimeFilter(
            start_date=datetime(2026, 4, 1),
            end_date=datetime(2026, 4, 30)
        )
        
        result = tf.to_dict()
        
        assert result["start_date"] == "2026-04-01T00:00:00"
        assert result["end_date"] == "2026-04-30T00:00:00"
    
    def test_to_dict_with_none(self):
        """Test TimeFilter with None values."""
        tf = TimeFilter(start_date=datetime(2026, 4, 1))
        
        result = tf.to_dict()
        
        assert result["start_date"] is not None
        assert result["end_date"] is None


class TestTimeFilterDateCalculation:
    """Test time filter date calculations."""
    
    def test_today_reference(self):
        """Test that calculation is based on current time."""
        parser = TemporalQueryParser()
        result = parser.parse("last 1 days")
        
        # Should be approximately today
        now = datetime.now()
        diff = abs((result.end_date - now).total_seconds())
        assert diff < 60  # Within 1 minute
