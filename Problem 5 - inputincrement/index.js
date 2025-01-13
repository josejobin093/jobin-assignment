
let result = undefined;

function increment() {

	const input = document.querySelector("#numberTextbox").value;

	if (result === undefined)
		result = parseInt(input);
	else 
		result++;

	document.querySelector("#result").innerText = result;
}

document.querySelector("#incrementBtn").addEventListener("click", increment);
