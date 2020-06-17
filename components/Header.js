import React from 'react';
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'

import { OBETNER_USUARIO } from '../schemas'

const Header = () => {

  // Rounting
  const router = useRouter()

  // Query Apollo
  const { data, loading, error} = useQuery(OBETNER_USUARIO)

  // console.log(data)
  // console.log(loading)
  // console.log(error)

  // Proteger que no accedamos a data antes de tener resultados

  if (loading) return null

  // Si no hay informacion
  if (!data.obtenerUsuario) {
    return router.push('/login')
  }

  const { nombre, apellido } = data.obtenerUsuario

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return ( 
    <div className="sm:flex sm:justify-between mb-6">
      <p className="mr-2 mb-5 lg:mb-0">Hola: {nombre} {apellido}</p>

      <button 
        onClick={() => cerrarSesion()}
        type="button" 
        className="bg-blue-800 w-full sm:w-auto font-bold uppercase text-xs rounded py-1 px-2 text-white shadow-md"
      >
        Cerrar Sesión
        </button>
    </div>
  );
}
 
export default Header;