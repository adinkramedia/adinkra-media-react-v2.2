export default {
  name: 'album',
  title: 'Album / Collection',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },

    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' }
    },

    { name: 'coverImage', title: 'Cover Image', type: 'image' },

    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    },

    // 🔗 Tracks
    {
      name: 'tracks',
      title: 'Tracks Included',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'audioTrack' }]
        }
      ]
    },

    // 🎥 Video demos
    {
      name: 'videoDemos',
      title: 'Video Demos',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'videoDemo' }]
        }
      ]
    },

    // 🎧 Preview audio
    {
      name: 'previewAudio',
      title: 'Preview Audio',
      type: 'array',
      of: [{ type: 'file' }]
    },

    { name: 'freeDownload', title: 'Free Download?', type: 'boolean' },

    {
      name: 'affiliateLinks',
      title: 'Affiliate Links',
      type: 'array',
      of: [{ type: 'block' }]
    },

    // 🗂 Category
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Drum Pack', value: 'drum-pack' },
          { title: 'Ambient Pack', value: 'ambient-pack' },
          { title: 'Traditional Instruments', value: 'traditional-instruments' },
          { title: 'Cinematic Pack', value: 'cinematic-pack' },
          { title: 'Sound FX Pack', value: 'sound-fx-pack' },
          { title: 'Synth Pack', value: 'synth-pack' },
          { title: 'Drum Library', value: 'drum-library' }
        ]
      }
    },

    // 🎼 Genre
    {
      name: 'packGenre',
      title: 'Pack Genre',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          'Cinematic',
          'Ambient',
          'Traditional',
          'Electronic',
          'Orchestral',
          'World',
          'Ancient'
        ]
      }
    },

    { name: 'totalFiles', title: 'Total Files', type: 'number' },

    // 🔥 MULTIPLE DOWNLOAD LINKS (FIXED)
    {
      name: 'downloadUrls',
      title: 'Download URLs',
      description: 'Add one or more download links (e.g. full pack, stems, bonus files)',
      type: 'array',
      of: [
        {
          type: 'url',
          title: 'Download Link'
        }
      ]
    },

    { name: 'releaseDate', title: 'Release Date', type: 'datetime' },

    {
      name: 'price',
      title: 'Price (Dollar)',
      type: 'number'
    }
  ]
}