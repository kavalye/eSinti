const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

// Arkadaşlık İsteği Gönderme
exports.sendFriendRequest = async (req, res) => {
  const { receiverId } = req.params;
  const requesterId = req.user.id;

  try {
    if (requesterId === receiverId) {
      return res.status(400).json({ msg: 'Kendinize arkadaşlık isteği gönderemezsiniz' });
    }

    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Arkadaşlık isteği zaten gönderilmiş' });
    }

    const friendRequest = new FriendRequest({
      requester: requesterId,
      receiver: receiverId,
    });

    await friendRequest.save();

    res.json({ msg: 'Arkadaşlık isteği gönderildi' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Arkadaşlık İsteğine Yanıt Verme
exports.respondFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  const { response } = req.body; // 'accepted' veya 'rejected'

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ msg: 'Arkadaşlık isteği bulunamadı' });
    }

    if (friendRequest.receiver.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Bu isteğe yanıt verme yetkiniz yok' });
    }

    if (response === 'accepted') {
      const user = await User.findById(req.user.id);
      const requester = await User.findById(friendRequest.requester);

      user.friends.push(requester.id);
      requester.friends.push(user.id);

      await user.save();
      await requester.save();

      friendRequest.status = 'accepted';
      await friendRequest.save();

      res.json({ msg: 'Arkadaşlık isteği kabul edildi' });
    } else if (response === 'rejected') {
      friendRequest.status = 'rejected';
      await friendRequest.save();

      res.json({ msg: 'Arkadaşlık isteği reddedildi' });
    } else {
      res.status(400).json({ msg: 'Geçersiz yanıt' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// Arkadaşları Getirme
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', ['username', 'email', 'profilePicture']);
    res.json(user.friends);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Sunucu Hatası');
  }
};


// Kullanıcı Puanlarını ve Rozetlerini Güncelleme Fonksiyonu
const updateBadges = async (user) => {
    if (user.points >= 500 && !user.badges.includes('İleri')) {
      user.badges.push('İleri');
    } else if (user.points >= 100 && !user.badges.includes('Başlangıç')) {
      user.badges.push('Başlangıç');
    }
    await user.save();
  };
  
  // likePost Fonksiyonunda Güncelleme
  exports.likePost = async (req, res) => {
    // Önceki kodlar
    user.points += 10;
    await user.save();
  
    await updateBadges(user);
  
    res.json({ msg: 'Beğenildi', points: user.points, badges: user.badges });
  };