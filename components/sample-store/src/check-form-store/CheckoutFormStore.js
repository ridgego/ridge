import axios from 'axios'

export default {
  state: () => {
    return {
      states: [],
      countries: [],
      formValid: null,
      checkForm: {
        firstName: '',
        lastName: '',
        accountName: '',
        email: '',
        country: '',
        state: '',
        zipCode: '',
        isShippingSame: false,
        payment: ''
      },
      checkFormValid: {
        firstName: null,
        lastName: null,
        accountName: null,
        country: null,
        state: null,
        payment: null
      }
    }
  },

  computed: {
    statesCurrent: {
      get: state => {
        return state.states.filter(st => st.country_id === parseInt(state.checkForm.country))
      },
      dependencies: ['checkForm.country']
    }
  },

  async setup () {
    this.state.countries = (await axios.get('//raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries.json')).data.map(country => ({
      label: country.name,
      value: country.id
    }))

    this.state.states = (await axios.get('//raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/states.json')).data.map(st => ({
      label: st.name,
      value: st.state_code,
      country_id: st.country_id
    }))
  },

  exit () {},
  watch: {
    todoText (val) {
      if (val !== '') {
        this.state.todoInvalid = false
      }
    }
  },

  actions: {
    checkAndSubmitForm () {
      const checkFormTest = {
        firstName: /^.+$/,
        lastName: /^.+$/,
        country: /^.+$/,
        state: /^.+$/,
        payment: /^.+$/,
        accountName: /[a-zA-Z][0-9a-zA-Z\\_]*/
      }

      let isValid = true
      for (const key in checkFormTest) {
        if (!this.state.checkForm[key].match(checkFormTest[key])) {
          isValid = false
          this.state.checkFormValid[key] = false
        } else {
          this.state.checkFormValid[key] = true
        }
      }
      this.state.formValid = isValid
    }
  }
}
