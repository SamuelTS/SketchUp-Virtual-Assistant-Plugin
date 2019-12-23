/**
 * Virtual Assistant (VAT) Chat Room.
 *
 * @package VAT extension for SketchUp
 *
 * @copyright © 2019 Samuel Tallet
 *
 * @licence GNU General Public License 3.0
 */

/**
 * VAT plugin namespace.
 */
VAT = {}

/**
 * User name.
 */
VAT.userName = ''

/**
 * Memory.
 */
VAT.memory = {}

/**
 * Save memory each 5 seconds.
 */
VAT.saveMemoryRegularly = () => {

	window.setInterval(() => {

		sketchup.saveMemory(VAT.memory)

	}, 5000)

}

/**
 * Enables user input auto-completion.
 *
 * @return {void}
 */
VAT.enableAutoComplete = () => {

	new autoComplete({

		selector: '#user-input',

		minChars: 2,

		source: (term, suggest) => {

			term = term.toLowerCase();
			
			var choices = [

				'Clean my model.',
				'Draw me a cube with a height of 1m, width of 1m and depth of 1m.',
				'Draw me a cone with a radius of 1m and height of 1m.',
				'Draw me a cylinder with a radius of 1m and height of 1m.',
				'Draw me a prism with a radius of 1m, height of 1m and 6 sides.',
				'Draw me a pyramid with a radius of 1m, height of 1m and 4 sides.',
				'Draw me a sphere with a radius of 1m.',
				'Search for a plugin about ...'

			];
			
			var suggestions = [];

			for (i = 0; i < choices.length; i++) {

				if ( ~choices[i].toLowerCase().indexOf(term) ) {

					suggestions.push(choices[i])

				}

			}

			suggest(suggestions)

		}

	})

}

/**
 * Capitalizes first letter of a string.
 *
 * @param {string} string
 *
 * @return {string}
 */
VAT.capitalize = string => {

    return string.charAt(0).toUpperCase() + string.slice(1)

}

/**
 * Returns a random synonym for an expression.
 *
 * @param {string} expr Expression.
 *
 * @return {string} Synonym.
 */
VAT.synonym = expr => {

	switch (expr) {

		case 'I take note.':

			var array = ['I take note.', 'Noted.', 'It\'s understood.']

			return array[Math.floor(Math.random() * array.length)]

			break

		case 'OK.':

			var array = ['OK.', 'Okay.', 'Good idea.', 'Let\'s go!']

			return array[Math.floor(Math.random() * array.length)]

			break

		case 'It\'s done.':

			var array = ['It\'s done.', 'Mission complete.']

			return array[Math.floor(Math.random() * array.length)]

			break

		case 'You\'re welcome.':

			var array = ['You\'re welcome.', 'No problem.', '😉']

			return array[Math.floor(Math.random() * array.length)]

			break

	}

	return expr

}

/**
 * Interacts with chat bot...
 *
 * @param {string} inputMessage
 *
 * @return {string} Output message.
 */
VAT.chatBot = inputMessage => {

	VAT.userSay(inputMessage)

	var outputMessages = []

	var doc = nlp(inputMessage)

	if ( doc.has('(hello|hi|hey)') ) {

		outputMessages.push('Hello ' + VAT.userName + '!')

	}

	if ( /\d+ *\+ *\d+/g.test(inputMessage) ) {

		var integers = inputMessage.match(/(\d+)/g)

		outputMessages.push(parseInt(integers[0]) + parseInt(integers[1]))

	} else if ( /\d+ *- *\d+/g.test(inputMessage) ) {

		var integers = inputMessage.match(/(\d+)/g)

		outputMessages.push(parseInt(integers[0]) - parseInt(integers[1]))

	} else if ( /\d+ *\* *\d+/g.test(inputMessage) ) {

		var integers = inputMessage.match(/(\d+)/g)

		outputMessages.push(parseInt(integers[0]) * parseInt(integers[1]))

	} else if ( /\d+ *\/ *\d+/g.test(inputMessage) ) {

		var integers = inputMessage.match(/(\d+)/g)

		outputMessages.push(parseInt(integers[0]) / parseInt(integers[1]))

	}

	if ( doc.has('^let\'s talk about .') ) {

		VAT.memory.__subject__ = doc.after('^let\'s talk about').text()

		if ( VAT.memory.__subject__ == 'you' ) {

			VAT.memory.__subject__ = 'me'

		} else if ( VAT.memory.__subject__ == 'me' ) {

			VAT.memory.__subject__ = 'you'

		}

		outputMessages.push(VAT.synonym('OK.'))

	} else if ( doc.has('^what are we talking about') ) {

		outputMessages.push('We\'re talking about ' + VAT.memory.__subject__ + '.')

	}

	if ( doc.has('. is a .') ) {

		var object = doc.match('[.] is a').text('normal')

		var a_class = doc.after('. is a').text('normal')

		if ( !VAT.memory[object] ) {

			VAT.memory[object] = {}

		}

		if ( !VAT.memory[object]['__classes__'] ) {

			VAT.memory[object]['__classes__'] = []

		}

		VAT.memory[object]['__classes__'].push(a_class)

		outputMessages.push(VAT.synonym('I take note.'))

	} else if ( doc.has('^what is #Determiner? . of #Determiner? .') ) {

		var prop = doc.match('^what is #Determiner? [.] of #Determiner? .' ).text('normal')
		var object = doc.match('^what is #Determiner? . of #Determiner? [.]' ).text('normal')

		if ( VAT.memory[object] && VAT.memory[object][prop] ) {

			outputMessages.push(VAT.capitalize(VAT.memory[object][prop]) + '.')

		} else {

			outputMessages.push('I don\'t know.')

		}

	} else if ( doc.has('. is .') ) {

		var object = doc.match('[.] is').text('normal')

		var prop = doc.match('is [.]').text('normal')

		if ( !VAT.memory[object] ) {

			VAT.memory[object] = {}

		}

		if ( VAT.memory[prop] && VAT.memory[prop]['__classes__'] ) {

			VAT.memory[object][ VAT.memory[prop]['__classes__'][0] ] = prop

		}

		outputMessages.push(VAT.synonym('I take note.'))

	} else if ( doc.has('^what do you know about .') ) {

		var object = doc.match('^what do you know about [.]').text('normal')

		if ( VAT.memory[object] && VAT.memory[object]['__classes__'] ) {

			outputMessages.push(VAT.capitalize(object) + ' is a ' + VAT.memory[object]['__classes__'].join(' and a ') + '.')

		} else {

			outputMessages.push('Nothing.')

		}

	}

	if ( doc.has('^how are you') ) {

		outputMessages.push('I\'m fine and you?')

	} 

	if ( doc.has('^you are #Determiner #Adjective bot') ) {

		var adjective = doc.match('#Adjective').text()

		if ( /^[aeiou]/g.test(adjective) ) {

			outputMessages.push('You are an ' + adjective + ' person.')

		} else {

			outputMessages.push('You are a ' + adjective + ' person.')

		}

	}

	if ( doc.has('^what can you do') ) {

		outputMessages.push('I can clean model, draw a 3D shape and search for a plugin.')

	} 

	if ( doc.has('clean (#Determiner|#Possessive)? SketchUp? model') ) {

		outputMessages.push(VAT.synonym('OK.'))

		sketchup.cleanModel({

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? (cube|box) with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.width = doc.match('width #Preposition [#Value]').text()
		attributes.height = doc.match('height #Preposition [#Value]').text()
		attributes.depth = doc.match('depth #Preposition [#Value]').text()

		sketchup.drawBox(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? cone with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.radius = doc.match('radius #Preposition [#Value]').text()
		attributes.height = doc.match('height #Preposition [#Value]').text()

		sketchup.drawCone(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? cylinder with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.radius = doc.match('radius #Preposition [#Value]').text()
		attributes.height = doc.match('height #Preposition [#Value]').text()

		sketchup.drawCylinder(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? prism with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.radius = doc.match('radius #Preposition [#Value]').text()
		attributes.height = doc.match('height #Preposition [#Value]').text()
		attributes.num_sides = doc.match('[#NumericValue] sides').text()

		sketchup.drawPrism(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? pyramid with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.radius = doc.match('radius #Preposition [#Value]').text()
		attributes.height = doc.match('height #Preposition [#Value]').text()
		attributes.num_sides = doc.match('[#NumericValue] sides').text()

		sketchup.drawPyramid(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('draw #Pronoun? #Determiner? sphere with') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var attributes = {}

		attributes.radius = doc.match('radius #Preposition [#Value]').text()

		sketchup.drawSphere(attributes, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('search for #Pronoun? #Determiner? plugin about') ) {

		outputMessages.push(VAT.synonym('OK.'))

		var topics = doc.after('search for #Pronoun? #Determiner? plugin about').text()

		sketchup.searchPlugin(topics, {

			onCompleted: () => { VAT.botSay(VAT.synonym('It\'s done.')) }

		})

	} else if ( doc.has('(goodbye|bye)') || doc.has('see you') ) {

		sketchup.closeChatRoom()

	}

	if ( doc.has('(thanks|thx)') || doc.has('thank you') ) {

		outputMessages.push(VAT.synonym('You\'re welcome.'))

	}

	if ( doc.has('(ok|okay|good|well)') ) {

		outputMessages.push('👍')

	}

	if ( outputMessages.length >= 1 ) {

		VAT.botSay(outputMessages.join(' '))

	} else {

		VAT.botSay('I didn\'t understand... Could you reformulate your sentence?')

	}

}

/**
 * Displays user message.
 *
 * @param {string} message
 *
 * @return {void}
 */
VAT.userSay = message => {

	document.querySelector('#messages').innerHTML += '<div class="message user-message">Me: ' + message + '</div>'

}

/**
 * Displays bot message.
 *
 * @param {string} message
 *
 * @return {void}
 */
VAT.botSay = message => {

	document.querySelector('#messages').innerHTML += '<div class="message bot-message">Bot: ' + message + '</div>'

}

/**
 * Listens to "user say" event.
 *
 * @return {void}
 */
VAT.listenToUserSay = () => {

	document.querySelector('#user-say-button').addEventListener('click', _event => {

		VAT.chatBot(document.querySelector('#user-input').value)

		document.querySelector('#user-input').value = ''

	})

}

// When document is ready:
document.addEventListener('DOMContentLoaded', _event => {

	sketchup.getUserName()

	sketchup.loadMemory({

		onCompleted: VAT.saveMemoryRegularly

	})

	VAT.enableAutoComplete()

	VAT.listenToUserSay()
	
})