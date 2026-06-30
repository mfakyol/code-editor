import { Routes, Route } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import EditorLayout from '@/layouts/EditorLayout'
import Home from '@/pages/Home'
import Editor from '@/pages/Editor'
import Explore from '@/pages/Explore'
import Profile from '@/pages/Profile'
import Account from '@/pages/Account'
import PenView from '@/pages/PenView'
import Embed from '@/pages/Embed'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import MyPens from '@/pages/MyPens'
import NotFound from '@/pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      {/* Standalone, chrome-free embed for iframing on other sites. */}
      <Route path="/embed/:id" element={<Embed />} />

      <Route element={<EditorLayout />}>
        <Route path="/editor" element={<Editor />} />
        <Route path="/pen/:id" element={<Editor />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/u/:username" element={<Profile />} />
        <Route path="/pen/:id/full" element={<PenView />} />
        <Route path="/pens" element={<MyPens />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes
