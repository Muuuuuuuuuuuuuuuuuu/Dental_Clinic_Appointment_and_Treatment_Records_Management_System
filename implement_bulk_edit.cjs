const fs = require('fs');
let file = fs.readFileSync('src/app/admin/schedule/ScheduleManagement.tsx', 'utf8');

// 1. Add states
file = file.replace(
  'const [editingShift, setEditingShift] = useState<{ shift: Shift | undefined, personId: number, personType: string, personName: string, dayNum: number } | null>(null);', 
`const [editingShift, setEditingShift] = useState<{ shift: Shift | undefined, personId: number, personType: string, personName: string, dayNum: number } | null>(null);
  
  // Bulk Edit State
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Array<{personId: number, personType: string, dayNum: number}>>([]);
  const [bulkStartTime, setBulkStartTime] = useState('09:00');
  const [bulkEndTime, setBulkEndTime] = useState('20:00');`
);

// 2. Add toggleCellSelection and applyBulkChanges before handleShiftChange
file = file.replace(
  'const handleShiftChange = (shiftId: number | undefined, field: \'start_time\' | \'end_time\' | \'is_off\', value: any) => {',
`const toggleCellSelection = (personId: number, personType: string, dayNum: number) => {
    const exists = selectedCells.find(c => c.personId === personId && c.personType === personType && c.dayNum === dayNum);
    if (exists) {
      setSelectedCells(selectedCells.filter(c => !(c.personId === personId && c.personType === personType && c.dayNum === dayNum)));
    } else {
      setSelectedCells([...selectedCells, { personId, personType, dayNum }]);
    }
  };

  const applyBulkChanges = (isOff: boolean) => {
    if (!isOff && (!bulkStartTime || !bulkEndTime)) return alert('กรุณาระบุเวลา');
    
    let currentShifts = [...shifts];
    let newPending = { ...pendingChanges };

    selectedCells.forEach(cell => {
      let existingShift = currentShifts.find(s => s.person_id === cell.personId && s.person_type === cell.personType && s.day_of_week === cell.dayNum);
      
      if (existingShift) {
        existingShift = { ...existingShift, is_off: isOff };
        if (!isOff) {
          existingShift.start_time = bulkStartTime;
          existingShift.end_time = bulkEndTime;
        }
        currentShifts = currentShifts.map(s => s.id === existingShift!.id ? existingShift! : s);
        newPending[existingShift.id] = existingShift;
      } else {
        const tempId = -Math.floor(Math.random() * 1000000);
        const newShift = {
          id: tempId,
          person_id: cell.personId,
          person_type: cell.personType as 'dentist' | 'staff',
          day_of_week: cell.dayNum,
          start_time: isOff ? undefined : bulkStartTime,
          end_time: isOff ? undefined : bulkEndTime,
          is_off: isOff
        } as Shift;
        currentShifts.push(newShift);
        newPending[tempId] = newShift;
      }
    });

    setShifts(currentShifts);
    setPendingChanges(newPending);
    setSelectedCells([]);
    setBulkEditMode(false);
  };

  const handleShiftChange = (shiftId: number | undefined, field: 'start_time' | 'end_time' | 'is_off', value: any) => {`
);

// 3. Add button in Header (near isTemplateCollapsed)
file = file.replace(
  '<button \n              onClick={() => setIsTemplateCollapsed(!isTemplateCollapsed)}',
`<button 
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                if (bulkEditMode) setSelectedCells([]);
              }} 
              className={\`px-3 py-1.5 text-xs rounded-lg font-bold transition-colors \${bulkEditMode ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}\`}
            >
              {bulkEditMode ? 'ยกเลิกจัดหลายรายการ' : 'เลือกจัดหลายรายการ'}
            </button>
            <button 
              onClick={() => setIsTemplateCollapsed(!isTemplateCollapsed)}`
);

// 4. Update Cell onClick and Style
file = file.replace(
  /onClick=\{\(\) => setEditingShift\(\{ shift, personId: person.id, personType: person.type, personName: person.name, dayNum: dayIndex \}\)\}\n\s*className=\{`w-full py-2 rounded-lg text-xs font-medium transition-colors hover:ring-2 ring-gray-200 \$\{isWorking \? 'bg-blue-50 text-blue-700' : 'bg-gray-100\/50 text-gray-400'}`\}/g,
(match) => {
  return `onClick={() => {
                            if (bulkEditMode) {
                              toggleCellSelection(person.id, person.type, dayIndex);
                            } else {
                              setEditingShift({ shift, personId: person.id, personType: person.type, personName: person.name, dayNum: dayIndex });
                            }
                          }}
                          className={\`w-full py-2 rounded-lg text-xs font-medium transition-all hover:ring-2 ring-gray-200 \${bulkEditMode && selectedCells.some(c => c.personId === person.id && c.personType === person.type && c.dayNum === dayIndex) ? 'ring-2 ring-blue-600 bg-blue-100 shadow-md transform scale-105' : isWorking ? 'bg-blue-50 text-blue-700' : 'bg-gray-100/50 text-gray-400'}\`}`;
}
);

// 5. Add FAB at the end
file = file.replace(
  '    </div>\n  );\n}\n',
`
      {bulkEditMode && selectedCells.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border px-6 py-4 flex items-center gap-4 z-50">
          <span className="font-bold text-[#1A365D]">เลือกแล้ว {selectedCells.length} รายการ</span>
          <div className="h-8 w-px bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <input type="time" value={bulkStartTime} onChange={e => setBulkStartTime(e.target.value)} className="border px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-gray-500 font-medium">ถึง</span>
            <input type="time" value={bulkEndTime} onChange={e => setBulkEndTime(e.target.value)} className="border px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => applyBulkChanges(false)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
              ตั้งเป็นทำงาน
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200"></div>
          <button onClick={() => applyBulkChanges(true)} className="px-5 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors">
            ตั้งเป็นหยุด
          </button>
        </div>
      )}
    </div>
  );
}
`
);

fs.writeFileSync('src/app/admin/schedule/ScheduleManagement.tsx', file);
console.log('Done!');
