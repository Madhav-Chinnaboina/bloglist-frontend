import axios from 'axios'
const baseUrl = "/api/login"

const login = (Credentials)=>{
    const response = axios.post(baseUrl,Credentials)
    return response.then(res=>res.data)
}
export default {login}