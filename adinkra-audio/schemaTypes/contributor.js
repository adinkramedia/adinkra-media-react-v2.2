// schemaTypes/contributor.js

export default {
  name: "contributor",
  title: "Contributor",
  type: "document",

  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: Rule => Rule.required()
    },

    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },

    // 🔐 Account Linking

    {
      name: "email",
      title: "Email",
      type: "string",
      description: "Contributor account email",
      validation: Rule =>
        Rule.email().warning("Please enter a valid email")
    },

    {
      name: "auth0Id",
      title: "Auth0 User ID",
      type: "string",
      description:
        "Automatically links this contributor profile to Auth0 login"
    },

    // Images

    {
      name: "profileImage",
      title: "Profile Image",
      type: "image",
      options: {
        hotspot: true
      }
    },

    {
      name: "bannerImage",
      title: "Banner Image",
      type: "image",
      options: {
        hotspot: true
      }
    },

    // Info

    {
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 5
    },

    {
      name: "verified",
      title: "Verified",
      type: "boolean",
      initialValue: false
    },

    {
      name: "genres",
      title: "Genres",
      type: "array",
      of: [{ type: "string" }]
    },

    {
      name: "location",
      title: "Location",
      type: "string"
    },

    // Social

    {
      name: "website",
      title: "Website",
      type: "url"
    },

    {
      name: "instagram",
      title: "Instagram",
      type: "url"
    },

    {
      name: "youtube",
      title: "YouTube",
      type: "url"
    }

  ],

  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "profileImage"
    }
  }
};