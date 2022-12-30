function validate(input){

	const inputType = input.dataset.type

    if(validators[inputType]) {
        validators[inputType](input)
    }

    if(input.validity.valid) {

    	input.parentElement.classList.remove('input-container--invalid')
    	input.parentElement.querySelector('.input-error-message').innerHTML = ''
    	input.parentElement.classList.add('input-container--valid')
    }else{

    	input.parentElement.classList.add('input-container--invalid')
    	input.parentElement.querySelector('.input-error-message').innerHTML = showErrorMessage(inputType, input)
    	
    	if(input.parentElement.classList.contains('input-container--valid')){
    		input.parentElement.classList.remove('input-container--valid')
    	}
    }
}

const errorTypes = [
	'valueMissing',
	'typeMismatch',
	'patternMismatch',
	'customError'
]


const errorMessages = {
	firstname: {
		valueMissing: 'O campo nome não pode estar vazio.'
	},
	lastname: {
		valueMissing: 'O campo sobrenome não pode estar vazio.'
	},
	phone: {
		valueMissing: 'O campo celular não pode estar vazio.'
	},
	cpf: {
		valueMissing: 'O campo CPF não pode estar vazio.',
		customError: 'O CPF digitado não é válido.'
	},
	birthdate: {
		valueMissing: 'O campo data de nascimento não pode estar vazio.',
		customError: 'Você deve ser maior de 18 anos para se cadastar'
	},
	cep: {
		valueMissing: 'O campo CEP não pode estar vazio.',
		patternMismatch: 'O CEP digitado não é válido',
		customError: 'CEP inválido'
	},
	email: {
		valueMissing: 'O campo de email não pode estar vazio.',
		typeMismatch: 'O e-mail digitado não é válido.'
	},
	password: {
		valueMissing: 'O campo senha não pode estar vazio.',
		patternMismatch: 'A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e deve conter pelo menos um caractere especial'
	},
	confirmPassword: {
		valueMissing: 'O campo confirmação de senha não pode estar vazio.',
		customError: 'A senha informada não é igual a anterior'
	}
}


const validators = {

	phone:input => phoneValidate(input),
	cpf:input => cpfValidate(input),
	birthdate:input => birthDateValidate(input),
	cep:input => cepRecover(input),
	confirmPassword:input => confirmPassword(input)
}


function showErrorMessage(inputType, input) {

	let message = ''

	errorTypes.forEach(erro => {
		if(input.validity[erro]){
			message = errorMessages[inputType][erro]
		}
	})

	return message
}


//birth date validators
function birthDateValidate(input) {

	const date = new Date(input.value)
	let message = ''
	
	if(!over18(date)){
		message = 'Você deve ser maior que 18 anos para se cadastrar';
	}

	input.setCustomValidity(message)
}

function over18(date) {

	const actualDate =  new Date()
	const dateOver18 = new Date(date.getUTCFullYear() + 18, date.getUTCMonth(), date.getUTCDate())

	return dateOver18 <= actualDate
}

function cpfValidate(input) {

	const formattedCpf = input.value.replace(/\D/g, '')
	let message = ''

	if(!checkRepeatedCpf(formattedCpf) || !checkCpfStructure(formattedCpf)) {
		message = 'O CPF digitado não é válido'
	}

	input.setCustomValidity(message)
}

function checkRepeatedCpf(cpf) {

	const repeatedValues = [
		'00000000000',
		'11111111111',
		'22222222222',
		'33333333333',
		'44444444444',
		'55555555555',
		'66666666666',
		'77777777777',
		'88888888888',
		'99999999999'
	]

	let validCpf = true

	repeatedValues.forEach(value => {
		if(value == cpf) {
			validCpf = false
		}
	})

	return validCpf
}

function checkCpfStructure(cpf) {

	const multiplier = 10
	return checkVerifyingDigit(cpf, multiplier)
}

function checkVerifyingDigit(cpf, multiplier) {

	if(multiplier >= 12){
		return true
	}

	let startingMultiplier = multiplier
	let sum  = 0
	const cpfWihtoutDigits = cpf.substr(0,multiplier - 1).split('')
	const verifyingDigit = cpf.charAt(multiplier - 1)

	for(let count = 0; startingMultiplier > 1; startingMultiplier--){
		sum = sum + cpfWihtoutDigits[count] * startingMultiplier
		count++
	}

	if(verifyingDigit == digitConfirm(sum)){
		return checkVerifyingDigit(cpf,multiplier + 1)
	}

	return false
}

function digitConfirm(sum) {
	return 11 - (sum % 11)
}

function cepRecover(input) {

	const cep = input.value.replace(/\D/g,'')
	const url = `https://viacep.com.br/ws/${cep}/json/`
	const options = {
		method: 'GET',
		mode: 'cors',
		headers: {
			'content-type': 'application/json;charset=utf-8'
		}
	}

	if(!input.validity.patternMismatch && !input.validity.valueMissing){

		fetch(url,options).then(
			response => response.json()
		).then(

			data => {
				if(data.erro){
					input.setCustomValidity('CEP inválido')
					return
				}
				input.setCustomValidity('')
				fillAdressFields(data)
				return
			}
		)
	}
}

function fillAdressFields(data) {

	const address = document.querySelector('[data-type="address"]')
	const city = document.querySelector('[data-type="city"]')
	const state = document.querySelector('[data-type="state"]')

	address.value = data.logradouro
	city.value = data.localidade
	state.value = data.uf
}

const phoneMask = (value) => {

	if (!value) return ""
	value = value.replace(/\D/g,'')
	value = value.replace(/(\d{2})(\d)/,"($1) $2")
	value = value.replace(/(\d)(\d{4})$/,"$1-$2")
	return value
}

function phoneValidate (phone) {
	
	phone.value = phoneMask(phone.value)

	if(phone.value == ''){
		phone.setCustomValidity('')
	}
}

function confirmPassword(input) {

	let password = document.querySelector('#password')
	
	if(input.value != password.value){
		input.setCustomValidity('A senha informada não é igual a anterior')
	}else{
		input.setCustomValidity('')
	}
}

//Start
const inputs = document.querySelectorAll('input')
inputs.forEach(input => {
    input.addEventListener('blur', (event) => {
        validate(event.target)
    })
})