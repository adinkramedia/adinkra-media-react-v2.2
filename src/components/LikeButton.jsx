import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function LikeButton({ slug, type }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("count")
        .eq("slug", slug)
        .eq("type", type)
        .single();

      if (data) {
        setCount(data.count);
      } else if (!data && !error) {
        // No entry exists yet, create it with count = 0
        await supabase.from("likes").insert([{ slug, type, count: 0 }]);
      }

      setLoading(false);
    };

    fetchLikes();
  }, [slug, type]);

  const handleLike = async () => {
    if (clicked) return;
    setClicked(true);
    const newCount = count + 1;
    setCount(newCount);

    const { error } = await supabase
      .from("likes")
      .upsert({ slug, type, count: newCount });

    if (error) console.error("Failed to like:", error);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || clicked}
      className={`px-4 py-2 rounded-full bg-adinkra-highlight text-black font-semibold ${
        clicked ? "opacity-50" : "hover:bg-yellow-400"
      } transition`}
    >
      ❤️ Like {loading ? "..." : count}
    </button>
  );
}