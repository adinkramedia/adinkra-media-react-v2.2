export default {
  name: 'videoDemo',
  title: 'Video Demo',
  type: 'document',
  fields: [
    // Title
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },

    // Description
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    },

    // Category
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Foley', value: 'foley' },
          { title: 'Soundtracks', value: 'soundtracks' },
          { title: 'Cinematic', value: 'cinematic' },
          { title: 'Ambient', value: 'ambient' },
          { title: 'World / Traditional', value: 'world-traditional' }
        ]
      }
    },

    // 🔗 References to Audio Tracks
    {
      name: 'relatedTracks',
      title: 'Related Tracks',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'audioTrack' }]
        }
      ]
    },

    // 🔗 References to Albums
    {
      name: 'relatedAlbums',
      title: 'Related Albums',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'album' }]
        }
      ]
    },

    // YouTube URL
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url'
    },

    // Thumbnail
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image'
    },

    // Flags
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean'
    },

    {
      name: 'premium',
      title: 'Premium',
      type: 'boolean'
    },

    // Date
    {
      name: 'createdAt',
      title: 'Created Date',
      type: 'datetime'
    }
  ]
}