/**
 * Utility to export JSON data to CSV and trigger a download
 */
export const exportToCSV = (data: any[], fileName: string, columns: { key: string; label: string }[]) => {
 if (!data || !data.length) return;

 // Create header row
 const headers = columns.map(col => `"${col.label}"`).join(',');

 // Create data rows
 const rows = data.map(item => {
 return columns.map(col => {
 // Handle nested properties (e.g., company.name)
 const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);

 // Format value: handle nulls, escapes quotes, and wrap in quotes
 const formattedValue = value === null || value === undefined ? '' : String(value).replace(/"/g, '""');
 return `"${formattedValue}"`;
 }).join(',');
 });

 const csvContent = [headers, ...rows].join('\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const link = document.createElement('a');

 if (link.download !== undefined) {
 const url = URL.createObjectURL(blob);
 link.setAttribute('href', url);
 link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
 link.style.visibility = 'hidden';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 }
};
