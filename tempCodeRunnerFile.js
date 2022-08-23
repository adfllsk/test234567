const express = require('express');
const app = express();
const bodyParser= require('body-parser');
const cors = require('cors')
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override')
app.use(bodyParser.json());
const router = express.Router();
app.use(methodOverride('_method'))
const axios = require('axios').default;


var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.1hcod.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    if (에러) return console.log(에러)
    db = client.db('login');

    app.listen(8080, function(){
        console.log('listening on 8080');
    });
    
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "./index.html");
});

app.get('/register', function(req, res){
  res.sendFile(__dirname + "./register.html");
}); //test

app.get('/fail', function(req, res){
  res.sendFile(__dirname + "./index.html");
});

app.post('/register', function(req, res){
    console.log(req.body)
    res.redirect('/login')
    db.collection('login').insertOne({ id : req.body.id, pw : req.body.pw, phone : req.body.phone /*name: req.body.name, userGender : req.body.userGender*/} , function(){
        console.log('저장완료'); 
    });
    //console.log(req.body)
}); //회원가입시 입력한 정보 DB에 저장시키는 코드



app.post('/userIdCheck',userIdCheack, function(req, res){
    var checkId = true;
    res.send(checkId)
});
function userIdCheack(req, res, next){
    db.collection('login').findOne( {id : req.body.id}, function(에러,결과){
        if(에러) return done(에러) 

        if(!결과){
            next()
        } else{
            var checkId = false;
            res.send(checkId)
        }
    })
} 



const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const { compile } = require('ejs');
const { get } = require('ajax');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
  res.sendFile(__dirname + "./login.html");
});

app.post('/loginCheck', loginCheck, function(req, res){
    var loginId = true;
    res.send(loginId)
    
})

 function loginCheck(req, res, next){
    db.collection('login').findOne({ id: req.body.id }, function (에러, 결과) {
        if (에러) return done(에러)
  
        if (!결과) {
          var loginId = false;
          res.send(loginId)
        } else{
            if (req.body.pw == 결과.pw) {          
                next()
            } else {
                var loginId = false;
                res.send(loginId)
            }
        }
        
    })
} 


app.post('/login', passport.authenticate('local', {
    failureRedirect : '/login'
}), function(req, res){
    res.redirect('/')
}); 

passport.use(new LocalStrategy({
    
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        console.log("fsdf")
      if (에러) return done(에러)
      if (!결과) return done(null, false, { message: '존재하지않는 아이디' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));/*  //로그인 */

passport.serializeUser(function (user, done){
    done(null, user.id)
}); //id 이용해 세션을 저장시키는 코드(로그인 성공시 발동)

app.post('/certifications', async function(req, res) {
    //const { imp_uid } = req.body.imp_uid; // request의 body에서 imp_uid 추출
    try {
      // 인증 토큰 발급 받기
      const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post", // POST methods
        headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
        data: {
          imp_key: "4043458038157100", // REST API키
          imp_secret: "mn3gNsqunlCU6yzcW0yDQtSfoaiOLwKBq0Pcgz0bJKXVLAMirJvqQqtqPhvpBiZpYYLEX7J5eG0Lz3q8" // REST API Secret
        }
        
      });
      const { access_token } = getToken.data.response; // 인증 토큰
      var url = 'https://api.iamport.kr/certifications/' + req.body.imp_uid
      // imp_uid로 인증 정보 조회
      const getCertifications = await axios({      
        url: url, // imp_uid 전달
        method: "get", // GET method
        headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
      });// 조회한 인증 정보
      var idfy = true;
      res.send(idfy)

      app.get('/phone', function(req, res){
        const certificationsInfo = getCertifications.data.response;
        res.send(certificationsInfo)
      })
      
    } catch(e) {
      console.error(e);
    }
    
  });

app.post('/userPhoneCheck', function (req, res){
  db.collection('login').findOne( {phone : req.body.phone}, function(에러,결과){
    if(에러) return done(에러) 

    if(!결과){
      var phck = true;
      res.send(phck)
    } else{
      var phck = false;
      res.send(phck)
    }
  })
})

module.exports = router;