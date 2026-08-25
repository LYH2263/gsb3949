import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import ToastContainer from './components/ui/Toast'
import ModalContainer from './components/ui/Modal'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
      <ModalContainer />
    </>
  )
}

export default App
