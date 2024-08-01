import { useState } from "react";
import { Button } from "./Button";

export const Users = ()=> {
    //backend call in this line
    const [users, setUsers] = useState([{
        firstName: "Vidyun",
        lastName: "Agarwal",
        _id: 1
    }]);

    return <>
        <div className="font-bold mt-6 text-lg">
            Users
        </div>
        <div className="my-2">
            <input type="text" placeholder="Search users...." className="w-full px-2 py-1 border rounded border-slate-200"/>
        </div>
        
        <div>{users.map(user => <User/>)}</div>
    </>
}

function User({user}) {
    return <div>
        
    </div>
}