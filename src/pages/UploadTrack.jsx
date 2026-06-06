import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Header from "../components/Header";
import { supabase } from "../lib/supabase";

export default function UploadTrack() {

const { user } = useAuth0();

const [form,setForm]=useState({

title:"",
price:"",
downloadUrl:"",
previewUrl:"",
coverUrl:""

});

const [loading,setLoading]=useState(false);

const [success,setSuccess]=useState(false);

const [error,setError]=useState("");

async function handleSubmit(e){

e.preventDefault();

setLoading(true);

setError("");
setSuccess(false);

try{

const { error:submitError } =
await supabase
.from("track_submissions")
.insert([{

user_email:user?.email,

contributor_name:
user?.name ||
user?.nickname ||
"Contributor",

title:form.title,

price:
form.price
? Number(form.price)
: 0,

cloudflare_url:
form.downloadUrl,

preview_url:
form.previewUrl,

cover_image:
form.coverUrl,

status:"pending"

}]);


if(submitError){

throw submitError;

}

setSuccess(true);

setForm({

title:"",
price:"",
downloadUrl:"",
previewUrl:"",
coverUrl:""

});

}catch(error){

console.error(
"Track submission error:",
error
);

setError(
error.message ||
"Something went wrong"
);

}

setLoading(false);

}

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="max-w-3xl mx-auto px-6 py-10">

<h1 className="text-3xl font-bold mb-2">

Upload Track

</h1>

<p className="text-adinkra-gold/60 mb-8">

Submit your track for review and approval.

</p>

<form
onSubmit={handleSubmit}
className="space-y-6"
>

{/* Track title */}

<input
required
type="text"
placeholder="Track Title"
value={form.title}
onChange={(e)=>

setForm({

...form,
title:e.target.value

})

}
className="
w-full
p-4
rounded-xl
bg-zinc-900
border
border-zinc-800
outline-none
focus:border-adinkra-highlight
"
/>

{/* Price */}

<input
type="number"
step="0.01"
placeholder="Price"
value={form.price}
onChange={(e)=>

setForm({

...form,
price:e.target.value

})

}
className="
w-full
p-4
rounded-xl
bg-zinc-900
border
border-zinc-800
outline-none
focus:border-adinkra-highlight
"
/>

{/* Cloudflare */}

<input
required
type="url"
placeholder="Cloudflare Download URL"
value={form.downloadUrl}
onChange={(e)=>

setForm({

...form,
downloadUrl:e.target.value

})

}
className="
w-full
p-4
rounded-xl
bg-zinc-900
border
border-zinc-800
outline-none
focus:border-adinkra-highlight
"
/>

{/* Preview */}

<input
required
type="url"
placeholder="Preview Audio URL"
value={form.previewUrl}
onChange={(e)=>

setForm({

...form,
previewUrl:e.target.value

})

}
className="
w-full
p-4
rounded-xl
bg-zinc-900
border
border-zinc-800
outline-none
focus:border-adinkra-highlight
"
/>

{/* Cover */}

<input
required
type="url"
placeholder="Cover Image URL"
value={form.coverUrl}
onChange={(e)=>

setForm({

...form,
coverUrl:e.target.value

})

}
className="
w-full
p-4
rounded-xl
bg-zinc-900
border
border-zinc-800
outline-none
focus:border-adinkra-highlight
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
hover:opacity-90
transition
disabled:opacity-50
"
>

{

loading
? "Submitting..."
: "Submit Track"

}

</button>

</form>

{/* Success */}

{success && (

<div
className="
mt-6
bg-green-900/30
border
border-green-500
p-4
rounded-xl
"
>

Track submitted successfully. Awaiting approval.

</div>

)}

{/* Error */}

{error && (

<div
className="
mt-6
bg-red-900/30
border
border-red-500
p-4
rounded-xl
"
>

{error}

</div>

)}

</div>

</div>

);

}