require('./db/db.connection');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.jwtsecret;
const express = require('express');
const app = express();
app.use(express.json());

const User = require('./models/user.model');
const Movie = require('./models/movie.model');

app.get('/',(req,res) => {
  res.send("Hello, Express!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// user signup API

app.post('/signup', async (req, res) => {
  try{
    const { userData } = req.body;
    const user = await signup(userData);
    
    res.status(201).json({
      message: "User Registered",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function signup(userData){
  try{
    const foundUsername = await User.findOne({ username: userData.username })
    const foundEmail = await User.findOne({ email: userData.email })
    if(foundUsername && foundEmail){
      throw new Error("User already registered");
    }else if(foundUsername){
      throw new Error("Username already taken");
    }
    
    const newUser = new User(userData);
    const user = await newUser.save();
    return user;
  }catch(error){
    throw error;
  }
}

// user login API

app.post('/login', async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await login(email, password);
    res.status(200).json({
      message: "User Logged In",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function login(email, password){
  try{
    const user = await User.findOne({ email: email });
    if(!user){
      throw new Error("User Not Found or Incorrect Email Entered");
    }
    if(user.password === password){
      return user;
    }else{
      throw new Error("Incorrect Password");
    }
  }catch(error){
    throw error;
  }
}

// changing password API

app.post('/user/:userId/password', async (req, res) => {
  try{
    const { email, currentPassword, newPassword } = req.body;
    const user = await changePassword(email, currentPassword, newPassword);
    res.status(200).json({
      message: "Password Changed Successfully",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function changePassword(email, currentPassword, newPassword){
  try{
    const user = await User.findOne({ email: email });
    if(!user){
      throw new Error("User Not Found or Incorrect Email Entered");
    }
    if(user && user.password === currentPassword){
      user.password = newPassword;
      const updatedUser = await user.save();
      return updatedUser;
    }else{
      throw new Error("Incorrect Password");
    }
  }catch(error){
    throw error;
  }
}

// updating Profile Picture API

app.post('/update-profile-picture', async (req, res) => {
  try{
    const { email, newProfilePictureUrl } = req.body;
    const user = await updateProfilePicture(email, newProfilePictureUrl);
    res.status(200).json({
      message: "Profile Picture Updated",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function updateProfilePicture(email, newProfilePictureUrl){
  try{
    const user = await User.findOne({ email: email });
    
    user.profilePictureUrl = newProfilePictureUrl;
    const updatedUser = await user.save();
    return updatedUser;
  }catch(error){
    throw error;
  }
}

// updating Contact Details API

app.post('/update-contact/:email', async (req, res) => {
  try{
    const { email } = req.params;
    const { updatedContactDetails } = req.body;
    const user = await updateContactDetails(email, updatedContactDetails);
    res.status(200).json({
      message: "Contact Details Updated",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function updateContactDetails(email, updatedContactDetails){
  try{
    const user = await User.findOne({ email: email });
    if(!user){
      throw new Error("Email Not Found");
    }
    Object.assign(user, updatedContactDetails);
    const updatedUser = await user.save();
    return updatedUser;
  }catch(error){
    throw error;
  }
}

// finding User by Phone Number API

app.get('/users/phone/:phoneNumber', async (req, res) => {
  try{
    const { phoneNumber } = req.params;
    const user = await findUserByPhoneNumber(phoneNumber);
    res.status(200).json({
      message: "User Found",
      user,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function findUserByPhoneNumber(phoneNumber){
  try{
    const user = await User.findOne({ phoneNumber });
    if(!user) throw new Error("Phone number not associated with any user")
    return user;
  }catch(error){
    throw error;
  }
}

// adding Rating and Review API

app.post('/movies/:movieId/rating', async (req, res) => {
  try{
    const { movieId } = req.params;
    const { reviewData } = req.body;
    const movie = await addRatingAndReview(movieId, reviewData);
    res.status(201).json({
      message: "Review Added",
      movie,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function addRatingAndReview(movieId, reviewData){
  try{
    const movie = await Movie.findOne({ _id: movieId });
    movie.ratings.push(reviewData.rating);
    const newReview = {
      user: reviewData.userId,
      text: reviewData.review,
    }
    movie.reviews.push(newReview);
    await movie.save();
    const updatedMovieData = await Movie.findById(movieId).populate('reviews.user', 'username profilePictureUrl');
    return updatedMovieData;
  }catch(error){
    throw new Error("Movie Not Found")
  }
}

// movie Reviews with User Details API

app.get('/movies/:movieId/reviews', async (req, res) => {
  try{
    const { movieId } = req.params;
    const reviews = await getMovieReviewsWithUserDetails(movieId);
    res.status(200).json({
      message: "Reviews Found",
      reviews,
    })
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

async function getMovieReviewsWithUserDetails(movieId){
  try{
    const movie = await Movie.findById(movieId).populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'username profilePictureUrl',
      }
    })
    if(!movie) throw new Error("Movie Not Found");

    const reviews = movie.reviews.slice(0,3).map((review) => ({
      review: review.text,
      user: review.user
    }));
    return reviews;
  }catch(error){
    throw error;
  }
}