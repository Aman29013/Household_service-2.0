export default {
    template: ` 
    <div class="container d-flex justify-content-center align-items-start vh-100 pt-5" style="margin-bottom: 150px; margin-top:50px;">
        <div class="card shadow-lg p-4" style="width: 100%; max-width: 600px;">
        
            <h1 class="text-center mb-4">Registration</h1>
            <div class="mb-3">
                <label for="name" class="form-label">Name:</label>
                <input id="name" type="text" class="form-control" placeholder="Enter your name" v-model="name" required/>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email:</label>
                <input id="email" type="email" class="form-control" placeholder="Enter your email" v-model="email" required @input="validateEmail"/>
                <small v-if="emailError" class="text-danger">{{ emailError }}</small>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input id="password" type="password" class="form-control" placeholder="Enter your password" v-model="password" required/>
            </div>
            <div class="mb-3">
                <label for="role" class="form-label">Role:</label>
                <select id="role" class="form-select" v-model="role" required>
                    <option disabled value="">Select Role</option>
                    <option value="customer">Customer</option>
                    <option value="professional">Professional</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="address" class="form-label">Address:</label>
                <input id="address" class="form-control" placeholder="Enter your address" v-model="address" required/>
            </div>
            <div class="mb-3">
                <label for="pincode" class="form-label">Pincode:</label>
                <input id="pincode" type="number" class="form-control" placeholder="Enter pincode" v-model="pincode" required @input="validatePincode"/>
                <small v-if="pincodeError" class="text-danger">{{ pincodeError }}</small>
            </div>
            <div class="mb-3">
                <label for="phone" class="form-label">Phone:</label>
                <input id="phone" type="tel" class="form-control" placeholder="Enter phone number" v-model="phone" required @input="validatePhone"/>
                <small v-if="phoneError" class="text-danger">{{ phoneError }}</small>
            </div>
            <div v-if="role === 'professional'">
                <div class="mb-3">
                    <label for="occupation" class="form-label">Service Name:</label>
                    <select id="occupation" class="form-select" v-model="occupation" required>
                        <option disabled value="">Select Service</option>
                        <option v-for="service in services" :key="service.service_id" :value="service.service_name">{{ service.service_name }}</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="experience" class="form-label">Experience:</label>
                    <input id="experience" type="number" class="form-control" placeholder="Enter experience" v-model="experience" required @input="validateExperience"/>
                    <small v-if="experienceError" class="text-danger">{{ experienceError }}</small>
                </div>
            </div>
            <button @click="register" class="btn btn-primary w-100">Register</button>
        </div>
    </div>
    `,

    data() {
        return {
            name: "",
            email: "",
            password: "",
            role: "",
            occupation: "",
            phone: "",
            address: "",
            pincode: "",
            experience: "",
            services: [],
            emailError: "",
            phoneError: "",
            pincodeError: "",
            experienceError: ""
        }
    },

    methods: {
        validateEmail() {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(this.email)) {
                this.emailError = "Please enter a valid email address.";
            } else {
                this.emailError = "";
            }
        },
        validatePhone() {
            const phonePattern = /^[0-9]{10}$/;
            if (!phonePattern.test(this.phone)) {
                this.phoneError = "Enter a valid 10-digit phone number.";
            } else {
                this.phoneError = "";
            }
        },
        validatePincode() {
            if (!Number.isInteger(Number(this.pincode)) || this.pincode <= 0) {
                this.pincodeError = "Pincode must be a positive integer.";
            } else {
                this.pincodeError = "";
            }
        },
        validateExperience() {
            if (!Number.isInteger(Number(this.experience)) || this.experience <= 0) {
                this.experienceError = "Experience must be a positive integer.";
            } else {
                this.experienceError = "";
            }
        },
        async register() {
            this.validateEmail();
            this.validatePhone();
            this.validatePincode();
            this.validateExperience();

            if (!this.name || !this.email || !this.password || !this.role || !this.address || !this.pincode || !this.phone) {
                alert("Please fill all fields.");
                return;
            }
        
            if (this.role === "professional" && (!this.occupation || !this.experience)) {
                alert("Please fill all fields.");
                return;
            }

            if (this.emailError || this.phoneError) {
                alert("Please fill correct details before submitting.");
                return;
            }

            try {
                const response = await fetch(location.origin + "/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        password: this.password,
                        address: this.address,
                        pincode: this.pincode,
                        phone: this.phone,
                        role: this.role,
                        ...(this.role === "professional" ? { 
                            service_name: this.occupation, 
                            experience: this.experience 
                        } : {})  
                    })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    if (this.role === "professional") {
                        alert("Registration Successful! Waiting for admin approval.");
                    } else {
                        alert("Registration Successful!");
                    }
                    console.log("Success:", data);
                    this.$router.push("/login");
                } else {
                    alert(`Registration Failed: ${data.message}`);
                    console.error("Error:", data);
                }
            } catch (error) {
                console.error("Request failed:", error);
                alert("An error occurred during registration.");
            }
        },
        async fetchservice() {
            const token = this.$store.state.auth_token;

            const serviceInfo = await fetch(location.origin + `/api/service`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': token,
                }
            });

            if (serviceInfo.ok) {
                this.services = await serviceInfo.json();
                console.log("Services fetched successfully");
            } else {
                console.error("Failed to fetch services", await serviceInfo.text());
            }
        }
    },
    mounted() {
        this.fetchservice();
    }
}