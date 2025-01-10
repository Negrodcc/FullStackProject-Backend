import { useState, useEffect} from 'react'
import Service from './services/persons'

const SuccessfulMessage = ({message}) => {
  if (message===null) {
    null
  }
  else {
    return (
      <div className='successfulMessage'>
        {message}
      </div>
    ) 
  }
}

const ErrorMessage = ({message}) => {
  if (message===null) {
    null
  }
  else {
    return (
      <div className='errorMessage'>
        {message}
      </div>
    ) 
  }
}

const FilterName = ({filterName, handleFilterName}) => {
  return (
    <>
      filter with name: <input value={filterName} onChange={handleFilterName}/>
    </>
  )
}

const PersonForm = ({newName, handleNameChange, newNumber, handleNumberChange, handleAddPerson}) => {
  return (
    <form onSubmit={handleAddPerson}> 
        <div>
        name: <input value={newName} onChange={handleNameChange}/>
        number: <input value={newNumber} onChange={handleNumberChange}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}

const Persons = ({filter_persons, handlerDeleted}) => {
  return (
    <div>
      {filter_persons.map(person => (
                  <p key={person.name}>{person.name} {person.number} <DeletedButton id = {person.id} handlerDeleted={handlerDeleted} /> </p>
      ))}
  </div>
  )
}

//Button to deleted a person
const DeletedButton = ({id, handlerDeleted})  => {
  //button 
  return (
    <button onClick={() => handlerDeleted(id)}>
      delete
    </button>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('initial name')
  const [newNumber, setNewNumber] = useState('+56 9xxxxxxxx')
  const [filterName, setFilterName] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const timerMessages = 5000

  //hook which fetch the initial data persons from the server in localhost:3001
  const hook = () => {
    Service
    .getAll()
    .then(allPersons => {
      console.log("the data recieved from the server is : ", allPersons)
      setPersons(allPersons)
    })
  }

  //useEffect only for the first render
  useEffect(hook, [])

  //new Name's handler: Event -> Void
  // set the new name with the value gaven in the input, which is within the form
  const handleNameChange = (event) => {
    console.log("the new name is : ", event.target.value)
    setNewName(event.target.value)
  }

  //new Number's handler: Event -> Void
  // set the new number with the value gaven in the input, which is within the form
  const handleNumberChange = (event) => {
    console.log("the new number is : ", event.target.value)
    setNewNumber(event.target.value)
  }

  //filter name's handler: Event -> Void
  // set the filter name with the value given by the user
  const handleFilterName = (event) => {
    console.log("the filter name is : ", event.target.value)
    setFilterName(event.target.value)
  }

  //Add Person's handler : Event -> Void
  const handleAddPerson = (event) => {
    event.preventDefault()
    //first we need to check that the newName hasn´t already be added 
    const nameDuplicated = persons.some(person => person.name === newName)
    if (nameDuplicated) {
      //if the name is a duplicated name, we see if the number is also duplicated
      const numberDuplicated = persons.some(person => person.number === newNumber)
      if (numberDuplicated) {
        alert(`${newName} is already added to the phonebook and you are not changing the phone nummber : ${newNumber}`)
      }
      else {
        //if there is a new number wee need to update it
        const userConfirmed = window.confirm(`${newName} is already added to the phonebook, replace the old number with the new one?`)
        if (userConfirmed) {
          //original data, and remember that nama is a unique key, so find will always return only one person
          const personToUpdate = persons.find(person => person.name == newName)
          const idPerson = personToUpdate.id
          //person updated with the new number
          const personUpdated = {...personToUpdate, number : newNumber}
          Service
            .update(idPerson, personUpdated) //updated it in the db.json
            .then(data => {
              console.log(`the person ${data.name} now has the next phonenumber : ${data.number}`)
              //set the persons with a new array with the updated data
              setPersons(persons.map((person) =>
                                  person.id === data.id ? { ...person, ...data } : person))
              setNewName('')
              setNewNumber('')
              //add the success message
              setSuccessMessage(`${data.name} updated with the new number : ${data.number}`)
              setTimeout(() => setSuccessMessage(null), timerMessages)
            })
            .catch( () => {
              setErrorMessage(`information of ${newName} has already removed from the server`)
              setNewName('')
              setNewNumber('')
              setTimeout(() => {
                setErrorMessage(null)
              }, timerMessages)
            })
        }
        else {
          console.log("user canceled")
        }
      }
      
    }
    else {
      //if the name is not duplicated, then we added to the persons array
      const newPerson = {name: newName,
                         number: newNumber}
      //Post with axios to update the data in the server
      Service
        .create(newPerson)
        .then(data => {
          console.log("the data returned in the post method is : ", data)
          const newPersons = persons.concat(data)                        
          console.log("the new persons array is : ", newPersons)
          //add the the new person to the array to be able to render it
          setPersons(newPersons)
          //how we already add the person, we restart the new variables
          setNewName('')
          setNewNumber('')
          //add the success message
          setSuccessMessage(`${data.name} added`)
          setTimeout(() => setSuccessMessage(null), 3000)
        })
    }
  }

  //Handler which call the destroy function in Service which do a deleted in axios
  //and use the window confirm
  const handlerDeleted = (id) => {
    const userConfirmed = window.confirm("¿Estás seguro de realizar esta acción?");
    if (userConfirmed) {  
      Service
      .destroy(id)
      .then(data => {
        console.log(`the person:  ${data.name} is deleted`)
        setPersons(persons.filter(person => person.id != id))
      })
    } else {
      // Acción si el usuario hace clic en "Cancelar"
      console.log("El usuario canceló.");
    } 
  }

  //Filter persons array
  const filter_persons = persons.filter(person => person.name.toLowerCase().includes(filterName.toLocaleLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <SuccessfulMessage message={successMessage} />
      <ErrorMessage message={errorMessage} />
      <FilterName filterName={filterName} handleFilterName={handleFilterName} />
      <h2>Add a new</h2>
      <h2>Numbers</h2>
      <PersonForm newName={newName} handleNameChange={handleNameChange} 
                  newNumber={newNumber} handleNumberChange={handleNumberChange} handleAddPerson={handleAddPerson} />
      <Persons filter_persons={filter_persons} handlerDeleted={handlerDeleted} />
    </div>
  )
}

export default App