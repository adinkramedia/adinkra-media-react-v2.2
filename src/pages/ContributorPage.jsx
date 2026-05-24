import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sanity } from "../lib/sanity";
import groq from "groq";

const contributorQuery = groq`
*[_type=="contributor" && slug.current==$slug][0]{
  _id,
  name,
  verified,
  bio,
  genres,
  location,
  website,
  instagram,
  youtube,

  profileImage{
    asset->{url}
  },

  bannerImage{
    asset->{url}
  },

  "tracks": *[
      _type=="audioTrack" &&
      contributor._ref==^._id
  ]|order(releaseDate desc){
      _id,
      title,
      slug,
      price,
      freeDownload,

      coverImage{
          asset->{url}
      }
  },

  "albums": *[
      _type=="album" &&
      contributor._ref==^._id
  ]|order(releaseDate desc){
      _id,
      title,
      slug,
      price,
      freeDownload,

      coverImage{
          asset->{url}
      }
  }
}
`;

export default function ContributorProfile() {

  const { slug } = useParams();
  const navigate = useNavigate();

  const [contributor,setContributor]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{

    async function load(){

      try{

        const data=await sanity.fetch(
          contributorQuery,
          {slug}
        );

        setContributor(data);

      }catch(err){

        console.error(err);

      }finally{

        setLoading(false);

      }

    }

    load();

  },[slug]);



  if(loading){

    return(
      <div className="min-h-screen bg-adinkra-bg flex items-center justify-center text-white">

        Loading Contributor...

      </div>
    );

  }

  if(!contributor){

    return(

      <div className="min-h-screen bg-adinkra-bg flex items-center justify-center text-white">

        Contributor not found

      </div>

    );

  }

  const profileImage=
    contributor.profileImage?.asset?.url ||
    "/placeholder-avatar.jpg";

  const bannerImage=
    contributor.bannerImage?.asset?.url ||
    "/placeholder-banner.jpg";


  return(

<div className="bg-adinkra-bg min-h-screen text-white">

{/* Banner */}

<div className="h-[350px] relative overflow-hidden">

<img
src={bannerImage}
alt={contributor.name}
className="w-full h-full object-cover"
/>

<div className="absolute inset-0 bg-gradient-to-t from-adinkra-bg via-black/40 to-black/20"/>

</div>



<div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">

<div className="flex flex-col md:flex-row gap-6">

<img
src={profileImage}
alt={contributor.name}
className="
w-40
h-40
rounded-full
border-4
border-adinkra-bg
object-cover
shadow-2xl
"
/>


<div className="flex-1">

<h1 className="text-4xl font-bold flex items-center gap-3">

{contributor.name}

{contributor.verified && (

<div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">

✓ Verified

</div>

)}

</h1>


{contributor.location && (

<p className="text-adinkra-gold/60 mt-2">

📍 {contributor.location}

</p>

)}



{contributor.genres?.length>0 &&(

<div className="flex gap-2 mt-4 flex-wrap">

{contributor.genres.map((genre)=>(

<span
key={genre}
className="
px-3
py-1
rounded-full
bg-adinkra-highlight/20
text-adinkra-highlight
text-sm
"
>

{genre}

</span>

))}

</div>

)}


{contributor.bio &&(

<p className="mt-6 text-adinkra-gold/80 leading-relaxed max-w-3xl">

{contributor.bio}

</p>

)}


<div className="flex gap-3 mt-6 flex-wrap">

{contributor.website && (

<a
href={contributor.website}
target="_blank"
rel="noreferrer"
className="px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
>

Website

</a>

)}

{contributor.instagram && (

<a
href={contributor.instagram}
target="_blank"
rel="noreferrer"
className="px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
>

Instagram

</a>

)}

{contributor.youtube && (

<a
href={contributor.youtube}
target="_blank"
rel="noreferrer"
className="px-4 py-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition"
>

YouTube

</a>

)}

</div>

</div>

</div>



{/* Tracks */}

<div className="mt-20">

<h2 className="text-2xl font-bold mb-6">

Tracks

</h2>

{contributor.tracks?.length ? (

<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

{contributor.tracks.map(track=>(

<div
key={track._id}
onClick={()=>
navigate(`/audio`)
}
className="
bg-zinc-900
rounded-xl
overflow-hidden
cursor-pointer
hover:scale-[1.03]
transition
"
>

<img
src={track.coverImage?.asset?.url || "/placeholder.jpg"}
alt={track.title}
className="w-full aspect-square object-cover"
/>

<div className="p-4">

<h3 className="font-semibold">

{track.title}

</h3>

<p className="text-adinkra-highlight mt-2">

{track.freeDownload
? "Free"
: `$${track.price || 0}`}

</p>

</div>

</div>

))}

</div>

):(

<p className="text-adinkra-gold/40">

No tracks available

</p>

)}

</div>



{/* Albums */}

<div className="mt-20 pb-20">

<h2 className="text-2xl font-bold mb-6">

Albums & Collections

</h2>

{contributor.albums?.length ? (

<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

{contributor.albums.map(album=>(

<div
key={album._id}
onClick={()=>navigate("/audio")}
className="
bg-zinc-900
rounded-xl
overflow-hidden
cursor-pointer
hover:scale-[1.03]
transition
"
>

<img
src={album.coverImage?.asset?.url || "/placeholder.jpg"}
alt={album.title}
className="w-full aspect-square object-cover"
/>

<div className="p-4">

<h3 className="font-semibold">

{album.title}

</h3>

<p className="text-adinkra-highlight mt-2">

{album.freeDownload
? "Free"
: `$${album.price || 0}`}

</p>

</div>

</div>

))}

</div>

):(

<p className="text-adinkra-gold/40">

No albums available

</p>

)}

</div>

</div>

</div>

);

}