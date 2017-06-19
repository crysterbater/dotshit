
        Polymer('fab-anim',{
            play: function() {
                var animHeight = document.body.clientWidth;
                if(document.body.clientWidth < document.body.clientHeight) animHeight = document.body.clientHeight;
                this.scale = Math.round((animHeight / 56) * 3);
                console.log("fabanim scale", this.scale)
                this.classList.add("active")
            }
        })
    