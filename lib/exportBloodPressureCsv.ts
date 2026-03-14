// HELPER: BUILD CSV STRING FOR BLOOD PRESSURE ENTRIES (FOR DOCTOR / EXTERNAL USE)

type BloodPressureRow = {
  date: string;
  systolic_1: number;
  diastolic_1: number;
  bpm_1: number;
  systolic_2: number;
  diastolic_2: number;
  bpm_2: number;
  systolic_3: number;
  diastolic_3: number;
  bpm_3: number;
  systolic_4: number;
  diastolic_4: number;
  bpm_4: number;
  systolic_5: number;
  diastolic_5: number;
  bpm_5: number;
};

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildBloodPressureCsv(entries: BloodPressureRow[]): string {
  const headers = [
    'Date',
    'Reading 1 (Systolic)',
    'Reading 1 (Diastolic)',
    'Reading 1 (BPM)',
    'Reading 2 (Systolic)',
    'Reading 2 (Diastolic)',
    'Reading 2 (BPM)',
    'Reading 3 (Systolic)',
    'Reading 3 (Diastolic)',
    'Reading 3 (BPM)',
    'Reading 4 (Systolic)',
    'Reading 4 (Diastolic)',
    'Reading 4 (BPM)',
    'Reading 5 (Systolic)',
    'Reading 5 (Diastolic)',
    'Reading 5 (BPM)',
    'Average (Systolic)',
    'Average (Diastolic)',
    'Average (BPM)',
  ];

  const headerLine = headers.map(escapeCsvCell).join(',');

  const dataLines = entries.map((row) => {
    const dateStr = row.date && typeof row.date === 'string' ? row.date.split('T')[0] : String(row.date);
    const avgS = Math.round(
      (row.systolic_1 + row.systolic_2 + row.systolic_3 + row.systolic_4 + row.systolic_5) / 5
    );
    const avgD = Math.round(
      (row.diastolic_1 + row.diastolic_2 + row.diastolic_3 + row.diastolic_4 + row.diastolic_5) / 5
    );
    const avgB = Math.round((row.bpm_1 + row.bpm_2 + row.bpm_3 + row.bpm_4 + row.bpm_5) / 5);
    const cells = [
      dateStr,
      row.systolic_1,
      row.diastolic_1,
      row.bpm_1,
      row.systolic_2,
      row.diastolic_2,
      row.bpm_2,
      row.systolic_3,
      row.diastolic_3,
      row.bpm_3,
      row.systolic_4,
      row.diastolic_4,
      row.bpm_4,
      row.systolic_5,
      row.diastolic_5,
      row.bpm_5,
      avgS,
      avgD,
      avgB,
    ];
    return cells.map(escapeCsvCell).join(',');
  });

  return [headerLine, ...dataLines].join('\n');
}
