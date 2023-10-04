const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 3000;


const calculateStatistics = _.memoize(async () => {
  try {
   
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
      },
    });

    const blogData = response.data;

   
    const totalBlogs = blogData.length;
    const longestTitleBlog = _.maxBy(blogData, (blog) => blog.title.length);
    const privacyBlogs = blogData.filter((blog) =>
      blog.title.toLowerCase().includes('privacy')
    );
    const uniqueTitles = _.uniqBy(blogData, 'title');

    return {
      totalBlogs,
      longestTitle: longestTitleBlog.title,
      privacyBlogs: privacyBlogs.length,
      uniqueTitles: uniqueTitles.map((blog) => blog.title),
    };
  } catch (error) {
    throw new Error('Failed to fetch or analyze blog data');
  }
}, { maxAge: 60000 }); 
app.get('/api/blog-stats', async (req, res) => {
  try {
    const statistics = await calculateStatistics();
    res.json(statistics);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/blog-search', (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "query" is required.' });
  }

  try {
   
    const searchResults = blogData.filter((blog) =>
      blog.title.toLowerCase().includes(query.toLowerCase())
    );

    res.json({ results: searchResults });
  } catch (error) {
    console.error('Error during blog search:', error);
    res.status(500).json({ error: 'Failed to perform blog search' });
  }
});


app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});