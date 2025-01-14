import axios from 'axios'
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://render-notes-oowh.onrender.com/api/persons' // Production
    : '/api/persons'; // Proxy for development


const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
  }

const create = (newObject) => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
}

const destroy = (id) => {
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
} 

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject)
    return request.then(response => response.data)
}

export default {getAll, create, destroy, update}
