import { useState } from 'react';

const useFetch = (cb)=>{ //cb-callback
const [data, setData] = useState(undefined);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(null);

const fn = async() =>{
     setLoading(true);
     setError(null);

     try{
        const reaponse = await cb(...args);
        setData(response);
        setError(null);
     }catch(error){
        setError(null);
        setData(response);
        toast.error(error.message);
     }finally{
        setLoading(false);
     }
};

return{data, loading,error,fn,setData};
};
export default useFetch;