"use client"

import { useState, useRef } from"react"
import { read, utils } from"xlsx"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from"@/components/ui/dialog"
import { Button } from"@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from"@/components/ui/table"
import { Badge } from"@/components/ui/badge"
import { Loader2, Upload, AlertCircle, CheckCircle2, FileSpreadsheet, X } from"lucide-react"
import { api } from"@/lib/api"
import { useToast } from"@/hooks/use-toast"
import { ScrollArea } from"@/components/ui/scroll-area"

interface ResultImportProps {
  testId: string
  testTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TestResultImport({ testId, testTitle, isOpen, onClose, onSuccess }: ResultImportProps) {
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const jsonData = utils.sheet_to_json(ws)
        
        // Normalize keys (handle different capitalizations)
        const normalized = jsonData.map((row: any) => {
          const keys = Object.keys(row)
          const findKey = (search: string) => keys.find(k => k.toLowerCase().includes(search.toLowerCase()))
          
          return {
            rollNo: row[findKey("roll") || "rollNo"] || row[findKey("student") || "studentId"],
            marksObtained: row[findKey("marks") || "marksObtained"] || row[findKey("score") || "score"],
            remarks: row[findKey("remarks") || "remarks"] || ""
          }
        }).filter(r => r.rollNo && r.marksObtained !== undefined)

        setData(normalized)
      } catch (err) {
        toast({ title: "Parsing Error", description: "Failed to read Excel file format.", variant: "destructive" })
      } finally {
        setParsing(false)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (data.length === 0) return
    
    setLoading(true)
    try {
      const response = await api.post(`/api/tests/${testId}/results/import`, { results: data })
      toast({ 
        title: "Import Complete", 
        description: `Successfully imported ${response.processed} results. ${response.skipped > 0 ? `Skipped ${response.skipped} unknown students.` : ""}` 
      })
      onSuccess()
      onClose()
    } catch (err) {
      toast({ title: "Import Failed", description: "An error occurred while saving the results.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    setData([])
    setFileName("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            Import Test Results
          </DialogTitle>
          <DialogDescription>
            Upload the results for <strong>{testTitle}</strong>. 
            The Excel should have columns for: <code>Roll No</code>, <code>Marks Obtained</code>, <code>Remarks</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          {data.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 border-2 border-dashed border-brown-800/20 rounded-md p-12 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 cursor-pointer transition-all hover:border-brown-800/40"
            >
              <div className="h-12 w-12 rounded-full bg-brown-800/10 flex items-center justify-center mb-4">
                {parsing ? <Loader2 className="h-6 w-6 animate-spin text-brown-800" /> : <Upload className="h-6 w-6 text-brown-800" />}
              </div>
              <h3 className="font-bold text-lg">Click to upload Excel</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center max-w-[280px]">
                Support .xlsx and .csv formats. Use student Roll Numbers for matching.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-col h-full overflow-hidden border rounded-md bg-background">
              <div className="p-3 border-b flex items-center justify-between bg-muted/10">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-bold">{data.length} Rows Parsed</Badge>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{fileName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearData} className="h-7 text-xs text-destructive hover:bg-destructive/5">
                  <X className="h-3 w-3 mr-1" /> Remove
                </Button>
              </div>
              
              <ScrollArea className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow className="text-[10px] uppercase font-bold text-muted-foreground">
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 100).map((row, idx) => (
                      <TableRow key={idx} className="h-10 text-sm">
                        <TableCell className="font-mono font-bold">{row.rollNo}</TableCell>
                        <TableCell className="text-emerald-700 font-bold">{row.marksObtained}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-[200px] italic">
                          {row.remarks || "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-[9px] font-bold uppercase py-0">Pending</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {data.length > 100 && (
                  <div className="p-4 text-center text-xs text-muted-foreground border-t italic">
                    Showing first 100 rows out of {data.length}...
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={loading || data.length === 0}
            className="min-w-[140px] bg-brown-800 hover:bg-brown-900 shadow-lg shadow-brown-900/15"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Confirm Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
