export default {
    template: `
    <div id="home" class="container mt-5 ">
    <br>
        <h1 class="text-center mb-4">Welcome to Household-Service App</h1>
        <div id="homecontent"class="card mb-4 shadow-lg">
            <div class="card-body">
                <h3 class="card-title">About Our App</h3>
                <p class="card-text">
                    Our app provides a platform where customers can book various services offered by professionals. 
                    Whether you need a plumber, electrician, or any other service, our app connects you with the best professionals in your area.
                </p>
                <h4 class="card-title">Facilities We Provide</h4>
                <ul>
                    <li>Easy booking of services</li>
                    <li>Verified professionals</li>
                    <li>Secure payment options</li>
                    <li>24/7 customer support</li>
                    <li>Real-time tracking of service requests</li>
                </ul>
                <div class="d-flex justify-content-center mt-4">
                    <router-link to="/login" class="btn btn-danger me-2">Login</router-link>
                    <router-link to="/register" class="btn btn-secondary">Register</router-link>
                </div>
            </div>
        </div>
    </div>
    `
}
