import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ACTUALIZAR_PEDIDO, ELIMINAR_PEDIDO, OBTENER_PEDIDOS_VENDEDOR_ID } from '../schemas'
import Swal from 'sweetalert2'

const Pedido = ({ pedido }) => {
  const { id, total, cliente, estado } = pedido
  const { nombre, apellido, email, telefono } = cliente

  const [ estadoPedido, setEstadoPedido ] = useState(estado)
  const [ clasePedido, setClasePedido ] = useState('')

  // Mutation para cambiar el estado del pedido
  const [ actualizarPedido ] = useMutation(ACTUALIZAR_PEDIDO)
  const [ eliminarPedido ] = useMutation(ELIMINAR_PEDIDO, {
    update(cache) {
      const { obtenerPedidosVendedor } = cache.readQuery({
        query: OBTENER_PEDIDOS_VENDEDOR_ID
      })
      cache.writeQuery({
        query: OBTENER_PEDIDOS_VENDEDOR_ID,
        data: {
          obtenerPedidosVendedor: obtenerPedidosVendedor.filter( pedido => pedido.id !== id ) 
        }
      })
    }
  })

  useEffect( () => {
     if (estadoPedido) {
       setEstadoPedido(estadoPedido)
     }
     ClasePedido()
  }, [estadoPedido])

  // Funcion que modifica el color del pedido de acuerdo a su estado
  const ClasePedido = () => {
    switch (estadoPedido) {
      case 'PENDIENTE':
        setClasePedido('border-yellow-500')
        break
      case 'COMPLETADO':
        setClasePedido('border-green-500')
        break
      case 'CANCELADO':
        setClasePedido('border-red-500')
        break
      default:
        setClasePedido('default')
        break
    }
  }

  // Cambiar estado del pedido
  const cambiarEstadoPedido = async (nuevoEstado) => {
    try {
      const { data } = await actualizarPedido({
        variables: {
          id,
          input: {
            estado: nuevoEstado,
            cliente: cliente.id
          }
        }
      })

      setEstadoPedido(data.actualizarPedido.estado)

    } catch (error) {
      console.log(error)
    }
  }

  const onChangeHandle = () => {
    Swal.fire({
      title: 'Deseas eliminar este pedido?',
      text: "Esta accion no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Eliminar',
      cancelButtonText: 'No, Cancelar'
    }).then(async (result) => {
      if (result.value) {

        try {
          // Eliminar por ID
          const { data } = await eliminarPedido({
            variables: { id }
          })

          // Mostrar la alerta
          Swal.fire(
            'Eliminado!',
            'El pedido ha sido eliminado',
            'success'
          )
        } catch (error) {
          // console.log(error)
          guardarMensaje(error.message.replace('GraphQL error: ', ''))
          setTimeout( () => {
            guardarMensaje(null)
          }, 3000)
        }

      }
    })
  }

  return (
    <div className={`mt-4 bg-white rounded p-6 md:grid md:grid-cols-2 md:gap-4 shadow-lg ${clasePedido} border-t-4 `}>
      <div className="">
        <p className="font-bold text-gray-800">Cliente: {nombre} {apellido}</p>

        {email && (
          <p className="flex items-center my-2">
            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            {email}
          </p>
        )}
        {telefono && (
          <p className="flex items-center my-2">
            <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            {telefono}
          </p>
        )}

        <h2 className="text-gray-800 font-bold mt-10">Estado Pedido: </h2>

        <select 
          className="mt-2 appearance-none bg-blue-600 border border-blue-600 text-white p-2 text-center rounded leading-tight focus:outline-none focus:bg-blue-600 focus:border-blue-500 uppercase text-sm font-bold"
          value={estadoPedido}
          onChange={ e => cambiarEstadoPedido(e.target.value) }
        >
          <option value="COMPLETADO">COMPLETADO</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>
      <div>
        <h2 className="text-gray-800 font-bold mt-2">Resumen del pedido:</h2>
        { pedido.pedido.map( producto => (
          <div key={producto.id} className="mt-4">
            <p className="text-sm text-gray-600">Producto: {producto.nombre}</p>
            <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
          </div>
        ) )}
        <p className="text-gray-800 mt-3 font-bold"> Total a pagar: 
          <span className="font-light"> $ {total}</span>
        </p>
        <button 
          className="flex items-center mt-4 bg-red-800 px-5 py-2  inline-block text-white rounded leading-tight uppercase text-xs font-bold"
          onClick={() => onChangeHandle()}
        >
          <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Eliminar Pedido
        </button>
      </div>
    </div>
  )
}
 
export default Pedido