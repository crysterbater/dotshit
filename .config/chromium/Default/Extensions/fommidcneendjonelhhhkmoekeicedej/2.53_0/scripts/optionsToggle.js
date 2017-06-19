// Javascript for welcome page buttons
function showFirstTime() {
	$('#firstTimeSection').toggle('slow');
	$('#updatesSection').hide();
}
function showUpdate() {
	$('#updatesSection').toggle('slow');
	$('#firstTimeSection').hide();
}

document.getElementById('firstTimeBtn').addEventListener('click',showFirstTime);
document.getElementById('oldTimerBtn').addEventListener('click',showUpdate);