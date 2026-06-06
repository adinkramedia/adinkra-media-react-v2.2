import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function CreateAlbum(){

const { user } = useAuth0();

const [title,setTitle]=useState("");

const [loading,setLoading]=useState(false);

const [success,setSuccess]=useState(false);

async function handleSubmit(e){

e.preventDefault();

setLoading(true);

try{

const {error}=await supabase
.from("album_submissions")
.insert([{

user_email:user?.email,

contributor_name:
user?.name ||

user?.nickname ||

"Contributor",

title:title,

status:"pending"

}]);

if(error){

throw error;

}

setTitle("");

setSuccess(true);

}catch(error){

console.error(
"Album submission error:",
error
);

}

setLoading(false);

}

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="max-w-3xl mx-auto px-6 py-10">

<h1 className="text-3xl font-bold mb-8">

Create Album

</h1>

<form
onSubmit={handleSubmit}
className="space-y-6"
>

<input
type="text"
placeholder="Album Title"
value={title}
onChange={(e)=>
setTitle(e.target.value)
}
required
className="
w-full
p-4
rounded-xl
bg-zinc-900
"
/>

<button
type="submit"
disabled={loading}
className="
w-full
bg-adinkra-highlight
text-black
font-bold
py-4
rounded-xl
"
>

{loading
? "Submitting..."
: "Submit Album"}

</button>

</form>

{success && (

<div
className="
mt-6
rounded-xl
bg-green-900/30
border
border-green-500
p-4
"
>

Album submitted for approval.

</div>

)}

</div>

</div>

);

}