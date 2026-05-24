import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { sanity } from "../lib/sanity";
import groq from "groq";

import Header from "../components/Header";

const query = groq`
*[
  _type=="contributor" &&
  email==$email
][0]{
  _id,
  name,
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
  ]{
    _id,
    title,
    price,
    freeDownload,

    coverImage{
      asset->{url}
    }
  },

  "albums": *[
    _type=="album" &&
    contributor._ref==^._id
  ]{
    _id,
    title,
    price,
    freeDownload,

    coverImage{
      asset->{url}
    }
  }
}
`;

export default function ContributorDashboard() {

  const { user, isAuthenticated, isLoading } =
    useAuth0();

  const [contributor, setContributor] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function load() {

      if (
        isLoading ||
        !isAuthenticated ||
        !user?.email
      ) {
        setLoading(false);
        return;
      }

      try {

        const data =
          await sanity.fetch(
            query,
            {
              email: user.email
            }
          );

        setContributor(data);

      } catch(error){

        console.error(
          "Dashboard load error:",
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

  if(
    !isAuthenticated
  ){

    return(

      <div className="min-h-screen bg-adinkra-bg text-white">

        <Header/>

        <div className="text-center py-20">

          Please log in first

        </div>

      </div>

    );

  }

  if(
    !contributor
  ){

    return(

      <div className="min-h-screen bg-adinkra-bg text-white">

        <Header/>

        <div className="text-center py-20">

          <h2 className="text-2xl font-bold">

            No contributor profile linked

          </h2>

          <p className="text-adinkra-gold/60 mt-3">

            Logged in as:

          </p>

          <p className="text-adinkra-highlight">

            {user?.email}

          </p>

        </div>

      </div>

    );

  }

  return(

    <div className="min-h-screen bg-adinkra-bg text-white">

      <Header/>

      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold">

          Welcome,
          {" "}
          {contributor.name}

        </h1>

        {contributor.verified && (

          <p className="text-blue-400 mt-1">

            ✓ Verified Contributor

          </p>

        )}

        <p className="text-adinkra-gold/60 mt-2">

          {contributor.location}

        </p>

      </div>

      {/* Tracks */}

      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-xl font-bold mb-4">

          Your Tracks

        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          {contributor.tracks?.map(track=>(

            <div
              key={track._id}
              className="bg-zinc-900 rounded-xl overflow-hidden"
            >

              <img
                src={
                  track.coverImage?.asset?.url ||
                  "/placeholder.jpg"
                }
                className="w-full aspect-square object-cover"
              />

              <div className="p-3">

                <h3>

                  {track.title}

                </h3>

                <p className="text-adinkra-highlight">

                  {track.freeDownload
                    ? "Free"
                    : `$${track.price}`}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Albums */}

      <div className="max-w-6xl mx-auto px-6 mt-10 pb-20">

        <h2 className="text-xl font-bold mb-4">

          Your Albums

        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          {contributor.albums?.map(album=>(

            <div
              key={album._id}
              className="bg-zinc-900 rounded-xl overflow-hidden"
            >

              <img
                src={
                  album.coverImage?.asset?.url ||
                  "/placeholder.jpg"
                }
                className="w-full aspect-square object-cover"
              />

              <div className="p-3">

                <h3>

                  {album.title}

                </h3>

                <p className="text-adinkra-highlight">

                  {album.freeDownload
                    ? "Free"
                    : `$${album.price}`}

                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}