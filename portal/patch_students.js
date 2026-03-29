const fs = require('fs');
const file = './src/modules/students/components/students-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove admissionId from state
content = content.replace(
  /const \[formData, setFormData\] = useState\(\{\s+admissionId:\s*"",\s+email:\s*""\s+\}\)/,
  'const [formData, setFormData] = useState({ email: "" })'
);

// 2. Remove admissionId from dirty check
content = content.replace(
  /const isCreateFormDirty = formData\.admissionId !== "" \|\| formData\.email !== "";/,
  'const isCreateFormDirty = formData.email !== "";'
);

// 3. Remove validation and admissionId payload from handleCreateStudent
const createStudentMatch = content.match(/const handleCreateStudent = async.*?fetchStudents\(\)/s);
if(createStudentMatch) {
  let handlerCode = createStudentMatch[0];
  handlerCode = handlerCode.replace(
    /if \(formData\.admissionId\.length < 3\) \{.*?return;\s+\}/s,
    ''
  );
  handlerCode = handlerCode.replace(
    /await api\.post\('\/students', \{\s*\.\.\.formData,\s*admissionId:\s*formData\.admissionId\.toUpperCase\(\)\.trim\(\)\s*\}\)/,
    "await api.post('/students', formData)"
  );
  handlerCode = handlerCode.replace(
    /setFormData\(\{ admissionId:\s*"", email:\s*"" \}\)/,
    'setFormData({ email: "" })'
  );
  content = content.replace(createStudentMatch[0], handlerCode);
} else {
  console.log("Failed to match handleCreateStudent");
}

// 4. Combine UI Dialogs
// We find the flex gap-2 container that holds both Dialogs and replace it.
const uiMatch = content.match(/<div className="flex gap-2">(\s*<Dialog open=\{importOpen}.*?<\/Dialog>\s*<\/div>)/s);

if(uiMatch) {
  const replacement = `<div className="flex gap-2">
                            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                              <DialogTrigger asChild>
                                <Button className="shadow-lg shadow-primary/20">
                                  <Plus className="mr-2 h-4 w-4" /> Add Students
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Add Students</DialogTitle>
                                  <DialogDescription>Create a new student account or import from XLSX.</DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="single" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="single">Single Student</TabsTrigger>
                                    <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="single">
                                    <form onSubmit={handleCreateStudent} className="space-y-4 pt-4">
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="email">Institute Email</Label>
                                          <Input id="email" type="email" placeholder="student@college.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button type="submit" disabled={createLoading}>
                                          {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Student Account"}
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </TabsContent>
                                  
                                  <TabsContent value="bulk">
                                    <form onSubmit={handleImportStudents} className="space-y-4 pt-4">
                                      <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                          <Label htmlFor="file">Select File (XLSX Only)</Label>
                                          <Input id="file" type="file" accept=".xlsx" onChange={(e) => setImportFile(e.target.files?.[0] || null)} />
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button type="submit" disabled={importLoading || !importFile}>
                                          {importLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Import Students"}
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                          </div>`;
  content = content.replace(uiMatch[0], replacement);
} else {
  console.log("Failed to match UI block");
}

fs.writeFileSync(file, content);
console.log("Patch successfully applied");
