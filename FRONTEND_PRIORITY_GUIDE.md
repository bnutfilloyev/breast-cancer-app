# FRONTEND DEVELOPMENT PRIORITY ORDER

## BOSHLASH TARTIBI (Step by step)

### STEP 1: Utility va Services (1 kun)
Birinchi navbatda foundationni qurish kerak:

```bash
cd frontend

# 1. Dependencies o'rnatish
npm install

# 2. API services yaratish
src/services/
├── patients.ts      # Patient CRUD
├── analyses.ts      # Analysis CRUD
└── statistics.ts    # Stats queries

# 3. React Query hooks
src/hooks/
├── usePatients.ts
├── usePatient.ts
├── useAnalyses.ts
└── useStatistics.ts
```

---

### STEP 2: Layout Components (1 kun)
Dashboard layout yaratish:

```typescript
// src/components/layout/Sidebar.tsx
export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Bemorlar', href: '/patients' },
    { icon: FileText, label: 'Tahlillar', href: '/analyses' },
    { icon: Settings, label: 'Sozlamalar', href: '/settings' },
  ]
  
  return (
    <aside className="w-64 bg-card border-r">
      {/* Logo */}
      {/* Menu items */}
      {/* User info */}
    </aside>
  )
}

// src/components/layout/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="h-16 border-b bg-card">
      {/* Search bar */}
      {/* Notifications */}
      {/* User menu */}
    </nav>
  )
}

// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

---

### STEP 3: Dashboard Home Page (1 kun)

```typescript
// src/app/(dashboard)/page.tsx
export default function DashboardPage() {
  const { data: stats } = useStatistics()
  
  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard 
          title="Jami Bemorlar"
          value={stats?.total_patients}
          icon={Users}
          trend="+12%"
        />
        <StatsCard 
          title="Tahlillar"
          value={stats?.total_analyses}
          icon={FileText}
          trend="+8%"
        />
        <StatsCard 
          title="Topilmalar"
          value={stats?.total_findings}
          icon={AlertCircle}
          trend="-5%"
        />
        <StatsCard 
          title="Faol Bemorlar"
          value={stats?.active_patients}
          icon={Activity}
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tahlillar statistikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={...} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>So'nggi tahlillar</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAnalyses />
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardContent className="flex gap-4 p-6">
          <Button onClick={() => router.push('/patients/new')}>
            <Plus className="mr-2" />
            Yangi Bemor
          </Button>
          <Button onClick={() => router.push('/analyses/new')}>
            <Upload className="mr-2" />
            Tahlil Yuklash
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### STEP 4: Patients Pages (2-3 kun)

#### 4a. Patients List
```typescript
// src/app/(dashboard)/patients/page.tsx
export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  
  const { data, isLoading } = usePatients({ search, page })
  
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Bemorlar"
        action={
          <Button onClick={() => router.push('/patients/new')}>
            Yangi Bemor
          </Button>
        }
      />
      
      {/* Search & Filters */}
      <div className="flex gap-4">
        <Input 
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* Filter buttons */}
      </div>
      
      {/* Table */}
      <Card>
        <PatientTable 
          data={data?.items}
          isLoading={isLoading}
          onView={(id) => router.push(`/patients/${id}`)}
          onEdit={(id) => router.push(`/patients/${id}/edit`)}
          onDelete={(id) => handleDelete(id)}
        />
      </Card>
      
      {/* Pagination */}
      <Pagination 
        page={page}
        totalPages={data?.total_pages}
        onPageChange={setPage}
      />
    </div>
  )
}
```

#### 4b. Add New Patient
```typescript
// src/app/(dashboard)/patients/new/page.tsx
export default function NewPatientPage() {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema)
  })
  
  const { mutate, isLoading } = useCreatePatient()
  
  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Bemor qo\'shildi')
        router.push('/patients')
      }
    })
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Yangi Bemor Qo'shish" />
      
      <Card className="mt-6">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Form fields */}
              <FormField name="full_name" label="To'liq ismi" required />
              <FormField name="medical_record_number" label="MRN" />
              <FormField name="date_of_birth" label="Tug'ilgan sana" type="date" />
              <FormField name="gender" label="Jinsi" type="select" />
              <FormField name="phone" label="Telefon" />
              <FormField name="email" label="Email" type="email" />
              <FormField name="address" label="Manzil" type="textarea" />
              <FormField name="notes" label="Izohlar" type="textarea" />
              
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Bekor qilish
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 4c. Patient Detail
```typescript
// src/app/(dashboard)/patients/[id]/page.tsx
export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const { data: patient, isLoading } = usePatient(Number(params.id))
  
  if (isLoading) return <Skeleton />
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={patient.full_name}
        action={
          <Button onClick={() => router.push(`/patients/${params.id}/edit`)}>
            Tahrirlash
          </Button>
        }
      />
      
      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shaxsiy Ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">MRN</dt>
                <dd>{patient.medical_record_number}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Tug'ilgan sana</dt>
                <dd>{formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)} yosh)</dd>
              </div>
              {/* More fields */}
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistika</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tahlillar soni:</span>
                <strong>{patient.analyses?.length || 0}</strong>
              </div>
              <div className="flex justify-between">
                <span>So'nggi tahlil:</span>
                <strong>{patient.analyses?.[0]?.created_at}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Analyses History */}
      <Card>
        <CardHeader>
          <CardTitle>Tahlillar Tarixi</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalysisHistoryTable data={patient.analyses} />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### STEP 5: Analysis Pages (3-4 kun)

#### 5a. New Analysis (Upload)
```typescript
// src/app/(dashboard)/analyses/new/page.tsx
export default function NewAnalysisPage() {
  const [mode, setMode] = useState<'multi' | 'single'>('multi')
  const [selectedPatient, setSelectedPatient] = useState<number>()
  const [files, setFiles] = useState<Record<string, File>>({})
  
  const { mutate, isLoading } = useInferMulti()
  
  const handleSubmit = () => {
    const formData = new FormData()
    Object.entries(files).forEach(([key, file]) => {
      formData.append(key, file)
    })
    if (selectedPatient) {
      formData.append('patient_id', String(selectedPatient))
    }
    
    mutate(formData, {
      onSuccess: (data) => {
        toast.success('Tahlil muvaffaqiyatli!')
        router.push(`/analyses/${data.analysis_id}`)
      }
    })
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Yangi Tahlil" />
      
      {/* Mode Selection */}
      <Card>
        <CardContent className="p-6">
          <Label>Tahlil turi</Label>
          <div className="flex gap-4 mt-2">
            <Button 
              variant={mode === 'multi' ? 'default' : 'outline'}
              onClick={() => setMode('multi')}
            >
              To'liq ko'rinish (4 ta rasm)
            </Button>
            <Button 
              variant={mode === 'single' ? 'default' : 'outline'}
              onClick={() => setMode('single')}
            >
              Bitta rasm
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Patient Selection */}
      <Card>
        <CardContent className="p-6">
          <Label>Bemor (ixtiyoriy)</Label>
          <PatientCombobox 
            value={selectedPatient}
            onChange={setSelectedPatient}
          />
        </CardContent>
      </Card>
      
      {/* File Upload */}
      <Card>
        <CardContent className="p-6">
          {mode === 'multi' ? (
            <MultiImageUploader 
              files={files}
              onChange={setFiles}
              views={['top', 'bottom', 'left', 'right']}
            />
          ) : (
            <SingleImageUploader 
              file={files.image}
              onChange={(file) => setFiles({ image: file })}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Submit */}
      <div className="flex gap-4">
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || Object.keys(files).length === 0}
        >
          {isLoading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Bekor qilish
        </Button>
      </div>
    </div>
  )
}
```

#### 5b. Analysis Result
```typescript
// src/app/(dashboard)/analyses/[id]/page.tsx
export default function AnalysisResultPage({ params }) {
  const { data: analysis, isLoading } = useAnalysis(Number(params.id))
  
  if (isLoading) return <Skeleton />
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Tahlil #${analysis.id}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportPDF(analysis.id)}>
              <Download className="mr-2" />
              PDF yuklash
            </Button>
            <Button onClick={() => router.push(`/analyses/${params.id}/edit`)}>
              Tahrirlash
            </Button>
          </div>
        }
      />
      
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Xulosa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={getStatusVariant(analysis.status)}>
                {analysis.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Topilmalar soni</p>
              <p className="text-2xl font-bold">{analysis.total_findings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kategoriya</p>
              <Badge variant={getCategoryVariant(analysis.dominant_category)}>
                {analysis.dominant_category}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sana</p>
              <p>{formatDateTime(analysis.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Images Grid */}
      <div className="grid grid-cols-2 gap-6">
        {analysis.images?.map((image) => (
          <Card key={image.id}>
            <CardHeader>
              <CardTitle>{image.view_type}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageViewer 
                src={`/api/files/images/${image.relative_path}`}
                detections={image.detections_data}
                width={image.width}
                height={image.height}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {image.detections_count} ta topilma
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Findings & Recommendations */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Topilmalar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {analysis.findings_description || 'Izoh qo\'shilmagan'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tavsiyalar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">
              {analysis.recommendations || 'Tavsiya qo\'shilmagan'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## QISQA XULOSA

### Eng Muhim 5 ta Vazifa (Priority Order):

1. ✅ **Backend API'ni to'ldirish** (3-4 kun)
   - File serving endpoints
   - Statistics endpoints
   - Search endpoints
   - Inference qayta yozish

2. ✅ **Layout Components** (1 kun)
   - Sidebar
   - Navbar
   - DashboardLayout

3. ✅ **Dashboard Home** (1 kun)
   - Stats cards
   - Charts
   - Recent analyses

4. ✅ **Patients CRUD** (2-3 kun)
   - List, Add, Edit, View
   - Search & Filter
   - Forms & Validation

5. ✅ **Analysis Workflow** (3-4 kun)
   - Upload interface
   - Result display
   - Image viewer with detections

**Jami:** 10-13 kun (2 haftadan kam!)

### Keyingi Bosqichlar:
- Authentication (7-10 kun)
- Reports & Export (3-5 kun)
- Advanced features (7-10 kun)

**UMUMIY VAQT:** 5-7 hafta professional platforma uchun
