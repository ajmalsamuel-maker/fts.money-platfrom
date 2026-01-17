import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Check, Clock } from 'lucide-react';
import { format, addDays, startOfMonth, getDaysInMonth } from 'date-fns';

export default function SettlementCalendar({ settlements }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysArray = () => {
    const start = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  };

  const getSettlementForDate = (date) => {
    return settlements?.find(s => 
      new Date(s.settlement_date).toDateString() === date.toDateString()
    );
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const days = getDaysArray();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Settlement Calendar
          </CardTitle>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              className="px-2 py-1 text-sm hover:bg-slate-100 rounded"
            >
              ←
            </button>
            <span className="px-2 py-1 text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className="px-2 py-1 text-sm hover:bg-slate-100 rounded"
            >
              →
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {days.map((day, idx) => {
              const settlement = getSettlementForDate(day);
              return (
                <div
                  key={idx}
                  className={`p-2 text-center text-sm border rounded-lg ${
                    settlement ? 'bg-blue-50 border-blue-300' : 'bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-slate-600">{day.getDate()}</div>
                  {settlement && (
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-center">
                        {getStatusIcon(settlement.status)}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        ${settlement.net_amount}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span>Pending</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}