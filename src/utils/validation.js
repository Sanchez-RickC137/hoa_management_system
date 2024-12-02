export const formatPhoneNumber = (input) => {
	const cleaned = input.replace(/\D/g, '');
	const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
	if (match) {
	  return `(${match[1]}) ${match[2]}-${match[3]}`;
	}
	return input;
  };
  
export const validatePhone = (phone) => {
const cleaned = phone.replace(/\D/g, '');
return cleaned.length === 10;
};

export const validateEmail = (email) => {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);
};

export const validateName = (name) => {
const regex = /^[a-zA-Z\s-]+$/;
return regex.test(name);
};