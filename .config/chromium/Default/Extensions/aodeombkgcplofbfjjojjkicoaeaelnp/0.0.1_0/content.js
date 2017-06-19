$(document).ready(function(){
   
    $('body').mousemove(function(){
       $('.postItem').each(function(){
           var tk = $(this).attr('toolK');
           if(tk != 'yes'){
               $(this).attr('toolK', 'no');
               PostItems_callTool();
           }
       });
    });
    
    
    
});


function PostItems_callTool(){
    
    
    $('.postItem[toolK="no"]').each(function(){
       
        $(this).attr('toolK', 'yes');
        var tti = $(this);
        $('body').click(function(){
            tti.tooltipster('hide');
        });
        
        
        $(this).tooltipster({
            position: 'right',
            maxWidth: 375,
            interactive: true,
            content: '<img src="http://static.hypable.com/wp-content/themes/hypable/images/ajax_loader_gray.gif" width="15px" />  Loading...',
            animation:  'fade',
            contentAsHTML: true,
            functionBefore: function(origin, continueTooltip) {
                continueTooltip();
                var PostId = $(this).attr('data-post-id');
                if (origin.data('ajax') !== 'cached') {
                    $.ajax({
                        type: 'GET',
                        url: 'https://medium.com/p/'+PostId+'/quotes',
                        dataType: 'html',
                        success: function(data) {

                            var cont = data.replace('])}while(1);</x>','');
                            var obj = JSON.parse(cont);
                            var tooldata = '';                        
                            var pald = obj.payload.value;

                            if(pald.length != 0){
                                var finalPld = pald.length - 1;
                                var para = pald[finalPld].paragraphs[0].text;
                                para = para.substring(pald[finalPld].startOffset, pald[finalPld].endOffset);
                                tooldata = 'Top Highlight: <br>'+para;    
                            }else{
                                tooldata = 'No Highlights Found';
                            }

                            // update our tooltip content with our returned data and cache it
                            origin.tooltipster('content', tooldata).data('ajax', 'cached');

                        }
                    });
                }
            }
        });
    });
    
}