const Post = require('../models/Post');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');


// Gönderi Oluşturma
exports.createPost = async (req, res) => {
  const { content, image } = req.body;

  try {
    const newPost = new Post({
      author: req.user.id,
      content,
      image,
    });

    const post = await newPost.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Haber Akışını Getirme
exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    const friendsIds = user.friends.map(friend => friend._id);

    const posts = await Post.find({ author: { $in: friendsIds } })
      .populate('author', ['username', 'profilePicture'])
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Gönderiye Like Eklemek
exports.likePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Gönderi bulunamadı' });
    }

    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Zaten beğendiniz' });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.json({ msg: 'Beğenildi' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Gönderiye Dislike Eklemek
exports.dislikePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Gönderi bulunamadı' });
    }

    if (post.dislikes.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Zaten beğenmediniz' });
    }

    post.dislikes.push(req.user.id);
    await post.save();

    res.json({ msg: 'Beğenilmedi' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Multer Ayarları
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Gönderi Oluşturma
  exports.createPost = [
    upload.single('image'),
    async (req, res) => {
      const { content } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : '';
  
      try {
        const newPost = new Post({
          author: req.user.id,
          content,
          image,
        });
  
        const post = await newPost.save();
        res.json(post);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Sunucu Hatası');
      }
    }
  ];

  // Beğeni Ekleme
exports.likePost = async (req, res) => {
    const { postId } = req.params;
  
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ msg: 'Gönderi bulunamadı' });
      }
  
      if (post.likes.includes(req.user.id)) {
        return res.status(400).json({ msg: 'Zaten beğendiniz' });
      }
  
      post.likes.push(req.user.id);
      await post.save();
  
      // Kullanıcıya puan ekleme
      const user = await User.findById(req.user.id);
      user.points += 10; // Her beğeni için 10 puan
      await user.save();
  
      res.json({ msg: 'Beğenildi', points: user.points });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Sunucu Hatası');
    }
  };