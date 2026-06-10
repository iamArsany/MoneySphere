import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppRouter } from './router'
import { selectLanguage } from './store'

function App() {
  const language = useSelector(selectLanguage)

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  return <AppRouter />
}

export default App

