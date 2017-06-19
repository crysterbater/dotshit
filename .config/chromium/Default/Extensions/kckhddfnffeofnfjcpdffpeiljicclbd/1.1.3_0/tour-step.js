
        Polymer('tour-step',{
            backdrop: true,
            layered: true,
            backdropOverride: undefined,
            publish: {
                color: "#4CAF50",
                opacity: 0.9,
                img: "",
                position: "top-left"
            },

            attached: function() {
                var self = this;
                this.style.backgroundImage = "url(" + this.img + ")"
                this.classList.add(this.position);
                var buttons = this.querySelectorAll("paper-button[affirmative]");
                if (buttons.length) {
                    for (var i = 0; i < buttons.length; ++i) {
                        var button = buttons[i]
                        button.addEventListener("click", function () {
                            self.opened = false
                        });
                    }
                }
            },
            openedChanged: function() {
                console.log( "[openedChanged]", this.opened)
                if(this.opened) {
                    var css = this.shadowRoot.querySelector(".style").innerHTML
                    cssEl = document.createElement("style");
                    cssEl.innerHTML = css;
                    document.body.appendChild(cssEl)
                    this.backdropOverride = cssEl
                } else {
                    var completed;
                    this.addEventListener("core-overlay-close-completed", completed = function() {
                        this.removeEventListener("core-overlay-close-completed", completed);
                        if(this.backdropOverride) this.backdropOverride.remove()
                    });
                }
                this.super()
            }
        })
    