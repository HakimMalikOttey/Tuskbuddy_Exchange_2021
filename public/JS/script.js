//Without this, the page won't refresh when we change the history of the user.
//We need to be able to refresh the page in order for the modal to work as intended
window.addEventListener('popstate',function(event){
  window.location.reload();
});
var selectors = document.querySelectorAll('.selectors');
console.log(selectors);
var modal = document.getElementById("modal");
var exit = document.getElementById("exitButton");

//Closes the modal and brings user back to the participants main page
exit.addEventListener('click',function(e){
  modal.className = "disable";
  console.log(exit.getAttribute("original"));
  window.history.pushState({},'',exit.getAttribute("original"));
  // history.back();
});
selectors.forEach(function(item,index){
  //This allows for the user to view enlarged versions of pictures in a modal, while the Background
  //Remains at its current position, allowing for the user to view and then to keep scrolling without disruption
  //This also allows for the user to use links that can spawn the modal, so they dont have to click the buttons
  //in order to have a modal appear
  item.addEventListener('click',function(e){
    e.preventDefault();
    $.ajax({
      type:"GET",
      url: item.getAttribute("query"),
    }).done(function(yourData){
        modal.className = "enable";
        var bigImage = item.getAttribute("bigImage");
        var imageload = document.querySelectorAll('.largeimageload');
        var orginator =  bigImage.slice(0, bigImage.indexOf("_"));
        var colored = bigImage.slice(bigImage.indexOf("_")+4, bigImage.indexOf("."));
        var ogName = document.getElementById("originatorName");
        var colorBox = document.getElementById("colored");
        var colorName = document.getElementById("colorName");
        var colorLink = document.getElementById("colorLink");
        var originalLink = document.getElementById("originalLink");
        if(imageload[0].children.length > 0){
          imageload[0].children[0].src = "../submissions/" + bigImage;
        }
        else{
          var image = document.createElement("img");
          image.src = "../submissions/" + bigImage.toString();
          imageload[0].appendChild(image);
        }
        ogName.innerText = orginator;
        window.history.pushState({},'',item.getAttribute("query"));
        originalLink.href = `/submissions?name=${orginator}`
        if(colored != ""){
          colorBox.className = "enable";
          colorName.innerText= colored;
          colorLink.href = `/submissions?name=${colored}`
        }
        else{
          colorBox.className = "disable";
        }
        // window.location.reload();
    });
  })

});
