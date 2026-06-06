import { useEffect, useState } from "react";
import Header from "../components/Header";

import { supabase } from "../lib/supabase";
import { sanity } from "../lib/sanity";

export default function AdminModeration() {

const [tracks,setTracks]=useState([]);
const [albums,setAlbums]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{

loadSubmissions();

},[]);

async function loadSubmissions(){

setLoading(true);

try{

const {
data:trackData
}=await supabase
.from("track_submissions")
.select("*")
.eq("status","pending")
.order(
"created_at",
{ascending:false}
);

const {
data:albumData
}=await supabase
.from("album_submissions")
.select("*")
.eq("status","pending")
.order(
"created_at",
{ascending:false}
);

setTracks(trackData||[]);
setAlbums(albumData||[]);

}catch(error){

console.error(error);

}

setLoading(false);

}

async function approveTrack(track){

try{

const contributor=
await sanity.fetch(
`*[
_type=="contributor" &&
email==$email
][0]{
_id
}`,
{
email:track.user_email
}
);

if(!contributor){

alert(
"No contributor found"
);

return;

}

await sanity.create({

_type:"audioTrack",

title:track.title,

price:track.price,

freeDownload:
track.free_download,

contributor:{
_type:"reference",
_ref:contributor._id
},

releaseDate:
new Date().toISOString(),

externalDownloadUrl:
track.cloudflare_url,

externalPreviewUrl:
track.preview_url,

externalCoverImage:
track.cover_image

});

await supabase
.from(
"track_submissions"
)
.update({
status:"approved"
})
.eq(
"id",
track.id
);

loadSubmissions();

}catch(error){

console.error(
error
);

}

}

async function rejectTrack(track){

await supabase
.from(
"track_submissions"
)
.update({
status:"rejected"
})
.eq(
"id",
track.id
);

loadSubmissions();

}

async function approveAlbum(album){

try{

const contributor=
await sanity.fetch(
`*[
_type=="contributor" &&
email==$email
][0]{
_id
}`,
{
email:album.user_email
}
);

if(!contributor){

alert(
"No contributor found"
);

return;

}

await sanity.create({

_type:"album",

title:
album.title,

price:
album.price,

freeDownload:
album.free_download,

contributor:{
_type:"reference",
_ref:
contributor._id
},

releaseDate:
new Date().toISOString(),

downloadUrls:
album.download_urls,

previewAudio:
album.preview_audio,

externalCoverImage:
album.cover_image

});

await supabase
.from(
"album_submissions"
)
.update({
status:"approved"
})
.eq(
"id",
album.id
);

loadSubmissions();

}catch(error){

console.error(
error
);

}

}

async function rejectAlbum(album){

await supabase
.from(
"album_submissions"
)
.update({
status:"rejected"
})
.eq(
"id",
album.id
);

loadSubmissions();

}

if(loading){

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="py-20 text-center">

Loading moderation panel...

</div>

</div>

);

}

return(

<div className="min-h-screen bg-adinkra-bg text-white">

<Header/>

<div className="max-w-7xl mx-auto px-6 py-10">

<h1 className="text-4xl font-bold mb-10">

Admin Moderation

</h1>

{/* TRACKS */}

<div className="mb-14">

<h2 className="text-2xl font-bold mb-6">

Pending Tracks

</h2>

<div className="grid md:grid-cols-2 gap-6">

{tracks.map(track=>(

<div
key={track.id}
className="bg-zinc-900 rounded-xl p-6"
>

<h3 className="text-xl font-bold">

{track.title}

</h3>

<p>

Contributor:

{" "}

{track.contributor_name}

</p>

<p>

Price:

{" "}

${track.price}

</p>

<p>

Submitted by:

{" "}

{track.user_email}

</p>

<div className="flex gap-4 mt-6">

<button
onClick={()=>
approveTrack(
track
)
}
className="bg-green-600 px-5 py-2 rounded-lg"
>

Approve

</button>

<button
onClick={()=>
rejectTrack(
track
)
}
className="bg-red-600 px-5 py-2 rounded-lg"
>

Reject

</button>

</div>

</div>

))}

</div>

</div>

{/* ALBUMS */}

<div>

<h2 className="text-2xl font-bold mb-6">

Pending Albums

</h2>

<div className="grid md:grid-cols-2 gap-6">

{albums.map(album=>(

<div
key={album.id}
className="bg-zinc-900 rounded-xl p-6"
>

<h3 className="text-xl font-bold">

{album.title}

</h3>

<p>

Contributor:

{" "}

{album.contributor_name}

</p>

<p>

Price:

{" "}

${album.price}

</p>

<p>

Submitted by:

{" "}

{album.user_email}

</p>

<div className="flex gap-4 mt-6">

<button
onClick={()=>
approveAlbum(
album
)
}
className="bg-green-600 px-5 py-2 rounded-lg"
>

Approve

</button>

<button
onClick={()=>
rejectAlbum(
album
)
}
className="bg-red-600 px-5 py-2 rounded-lg"
>

Reject

</button>

</div>

</div>

))}

</div>

</div>

</div>

</div>

);

}