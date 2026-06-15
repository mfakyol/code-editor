import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import EditorLayout from '@/layouts/EditorLayout'
import Home from '@/pages/Home'
import Editor from '@/pages/Editor'
import NotFound from '@/pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<EditorLayout />}>
        <Route path="/editor" element={<Editor />} />
        <Route path="/pen/:id" element={<Editor />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
