import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

import {
  Music,
  Disc3,
  Eye,
  Upload,
  User,
  DollarSign,
  Clock,
  PlusCircle
} from "lucide-react";

import { sanity } from "../lib/sanity";
import { supabase } from "../lib/supabase";
import groq from "groq";

import Header from "../components/Header";

const query = groq`
*[
  _type=="contributor" &&
  email==$email
][0]{

  _id,
  name,
  slug,
  email,
  verified,
  bio,
  location,

  profileImage{
    asset->{url}
  },

  "tracks": *[
    _type=="audioTrack" &&
    contributor._ref==^._id
  ] | order(releaseDate desc){

    _id,
    title,
    price,
    freeDownload,
    releaseDate,

    coverImage{
      asset->{url}
    }
  },

  "albums": *[
    _type=="album" &&
    contributor._ref==^._id
  ] | order(releaseDate desc){

    _id,
    title,
    price,
    freeDownload,
    releaseDate,

    coverImage{
      asset->{url}
    }
  }

}
`;

export default function ContributorDashboard() {

const navigate=useNavigate();

const {
user,
isAuthenticated,
isLoading
}=useAuth0();

const [
contributor,
setContributor
]=useState(null);

const [
loading,
setLoading
]=useState(true);

const [
pendingCount,
setPendingCount
]=useState(0);

useEffect(()=>{

async function load(){

if(
isLoading ||
!isAuthenticated ||
!user?.email
){
setLoading(false);
return;
}

try{

const data=
await sanity.fetch(
query,
{
email:user.email
}
);

setContributor(data);

const [
trackPending,
albumPending
]=await Promise.all([

supabase
.from("track_submissions")
.select("*",{count:"exact",head:true})
.eq("user_email",user.email)
.eq("status","pending"),

supabase
.from("album_submissions")
.select("*",{count:"exact",head:true})
.eq("user_email",user.email)
.eq("status","pending")

]);

setPendingCount(
(trackPending.count || 0)
+
(albumPending.count || 0)
);

}catch(error){

console.error(
"Dashboard error:",
error
);

}

setLoading(false);

}

load();

},[
user,
isAuthenticated,
isLoading
]);

if(
loading ||
isLoading
){

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="text-center py-20">

Loading dashboard...

</div>

</div>

);

}

if(!isAuthenticated){

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="text-center py-20">

Please log in first

</div>

</div>

);

}

if(!contributor){

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="text-center py-20">

<h2 className="text-2xl font-bold">

No contributor profile linked

</h2>

<p className="mt-4 text-adinkra-gold/60">

Logged in as:

</p>

<p className="text-adinkra-highlight">

{user?.email}

</p>

</div>

</div>

);

}

const totalTracks=
contributor.tracks?.length || 0;

const totalAlbums=
contributor.albums?.length || 0;

const freeTracks=
contributor.tracks?.filter(
x=>x.freeDownload
).length || 0;

const paidTracks=
contributor.tracks?.filter(
x=>!x.freeDownload
).length || 0;

const recent=[
...(contributor.tracks||[]),
...(contributor.albums||[])
]
.slice(0,6);

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="max-w-7xl mx-auto px-6 py-10">

{/* PROFILE */}

<div className="bg-zinc-900 rounded-2xl p-6 mb-10">

<div className="flex flex-col md:flex-row gap-6 items-center">

<img
src={
contributor.profileImage?.asset?.url ||
"/placeholder.jpg"
}
className="w-28 h-28 rounded-full border-4 border-adinkra-highlight object-cover"
/>

<div className="flex-1">

<h1 className="text-3xl font-bold">

Welcome, {contributor.name}

</h1>

{contributor.verified && (

<p className="text-blue-400 mt-2">

✓ Verified Contributor

</p>

)}

<p className="text-adinkra-gold/60 mt-2">

{contributor.location}

</p>

<p className="mt-4 text-adinkra-gold/80">

{contributor.bio}

</p>

</div>

</div>

</div>

{/* STATS */}

<div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">

<div className="bg-zinc-900 p-5 rounded-xl">

<Music className="mb-3"/>

<h2 className="text-3xl font-bold">

{totalTracks}

</h2>

<p className="text-adinkra-gold/60">

Tracks

</p>

</div>

<div className="bg-zinc-900 p-5 rounded-xl">

<Disc3 className="mb-3"/>

<h2 className="text-3xl font-bold">

{totalAlbums}

</h2>

<p className="text-adinkra-gold/60">

Albums

</p>

</div>

<div className="bg-zinc-900 p-5 rounded-xl">

<DollarSign className="mb-3"/>

<h2 className="text-3xl font-bold">

{paidTracks}

</h2>

<p className="text-adinkra-gold/60">

Paid

</p>

</div>

<div className="bg-zinc-900 p-5 rounded-xl">

<Upload className="mb-3"/>

<h2 className="text-3xl font-bold">

{freeTracks}

</h2>

<p className="text-adinkra-gold/60">

Free

</p>

</div>

<div className="bg-zinc-900 p-5 rounded-xl">

<Clock className="mb-3"/>

<h2 className="text-3xl font-bold">

{pendingCount}

</h2>

<p className="text-adinkra-gold/60">

Pending

</p>

</div>

</div>

{/* ACTIONS */}

<div className="mb-10">

<h2 className="text-xl font-bold mb-5">

Quick Actions

</h2>

<div className="flex flex-wrap gap-4">

<button
onClick={()=>
navigate(
"/dashboard/upload-track"
)
}
className="px-6 py-3 rounded-xl bg-adinkra-highlight text-black font-bold flex gap-2 items-center"
>

<Upload size={18}/>

Upload Track

</button>

<button
onClick={()=>
navigate(
"/dashboard/create-album"
)
}
className="px-6 py-3 rounded-xl bg-zinc-900 flex gap-2 items-center"
>

<PlusCircle size={18}/>

Create Album

</button>

<button
onClick={()=>
navigate(
`/contributor/${contributor.slug?.current}`
)
}
className="px-6 py-3 rounded-xl bg-zinc-900 flex gap-2 items-center"
>

<Eye size={18}/>

Public Page

</button>

<button
className="px-6 py-3 rounded-xl bg-zinc-900 flex gap-2 items-center"
>

<User size={18}/>

Edit Profile

</button>

</div>

</div>

{/* RECENT */}

<div className="mb-10">

<h2 className="text-2xl font-bold mb-5">

Recent Uploads

</h2>

<div className="grid md:grid-cols-3 gap-4">

{recent.length===0 ? (

<div className="text-adinkra-gold/60">

No uploads yet

</div>

):(

recent.map(item=>(

<div
key={item._id}
className="bg-zinc-900 rounded-xl p-5"
>

<h3 className="font-bold">

{item.title}

</h3>

<p className="text-adinkra-highlight">

{item.freeDownload
? "Free"
: `$${item.price}`}

</p>

</div>

))

)}

</div>

</div>

</div>

</div>

);

}