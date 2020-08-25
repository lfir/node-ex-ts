const email = "mailto:psljp@protonmail.com",
  emailLinkElem = "Copyright &copy; <a href=" + email + ">Asta86</a> - " + (new Date()).getFullYear(),
  docsUrl = window.location.href.match(/https?:\/\/[^\/]+/)[0] + "/api/docs",
  baseImgUrl = "https://asta86.gitlab.io/img/",
  img0 = "<img src='" + baseImgUrl + "logo-github.png' alt='GitHub Logo' title='GitHub Profile' style='width:60px;height:60px;margin-right:20px;'>",
  a0 = "<a href='https://github.com/Asta1986' target='_blank' rel='noreferrer noopener'>" + img0 + "</a>",
  img1 = "<img src='" + baseImgUrl + "email-button.png' alt='Email Icon' title='Send Email' style='width:60px;height:60px;margin-left:20px;'>",
  a1 = "<a href=" + email + ">" + img1 + "</a>";
document.addEventListener("DOMContentLoaded", function() {
  // Add contact icons.
  document.getElementById("sociconsdiv").innerHTML = a0 + a1;
  // Add Copyright link to the Footer.
  document.getElementById("copyrightP").innerHTML = emailLinkElem;
  // Set the target of the API Docs link.
  document.getElementById("apidoca").setAttribute("href", docsUrl);
});

/* -----------------------------------------------
/* How to use? : Check the GitHub README
/* ----------------------------------------------- */
/* To load a config file (particles.json) you need to host this demo (MAMP/WAMP/local)... */
/*
particlesJS.load('particles-js', 'particles.json', function() {
  console.log('particles.js loaded - callback');
});
*/
/* Otherwise just put the config content (json): */
particlesJS("particles-js",
  {
    "particles": {
      "number": {
        "value": 60,
        "density": {
          "enable": true,
          "value_area": 1000
        }
      },
      "color": {
        "value": "#ffffff"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5
        },
        "image": {
          "src": "img/github.svg",
          "width": 100,
          "height": 100
        }
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 5,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 30,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 200,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 6,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 400,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 400,
          "size": 40,
          "duration": 2,
          "opacity": 8,
          "speed": 3
        },
        "repulse": {
          "distance": 200
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true,
    "config_demo": {
      "hide_card": false,
      "background_color": "#b61924",
      "background_image": "",
      "background_position": "50% 50%",
      "background_repeat": "no-repeat",
      "background_size": "cover"
    }
  }
);
