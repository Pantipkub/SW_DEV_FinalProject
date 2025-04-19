# Massage Reservation
A Software Development Practice's Final Project
<br><br>
## 📬 API Endpoints

#### Massage Center 🚩

| Method | Endpoint   | Description                |
| :-------- | :------- | :------------------------- |
| `GET` | `/api/v1/massageCenters` | Get all massage centers |
| `GET` | `/api/v1/massageCenters/:massageCenterID` | Get single massage centers |
| `POST` | `/api/v1/massageCenters` | Create new massage center |
| `PUT` | `/api/v1/massageCenters/:massageCenterID` | Update single massage center |
| `DELETE` | `/api/v1/massageCenters/:massageCenterID` | Delete single massage center |


#### Authentication 🔐

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `POST` | `/api/v1/auth/register` | Register user |
| `POST` | `/api/v1/auth/login` | Login user |
| `GET` | `/api/v1/auth/logout` | Logout user |
| `GET` | `/api/v1/auth/me` | Get Logged in User with Token |


#### Appointments 📩

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `GET` | `/api/v1/appointments` | Get all appointments |
| `GET` | `/api/v1/appointments/:appointmentID` | Get single appointment |
| `POST` | `/api/v1/massageCenters/:massageCenterID/appointments` | Add single appointment |
| `PUT` | `/api/v1/appointments/:appointmentID` | Update single appointment |
| `DELETE` | `/api/v1/appointments/:appointmentID` | Delete single appointment |


#### Statistics 📈

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `GET` | `/api/v1/statistics/massageCenters/:massageCenterId/daily-reservations` | Get daily number of reservations for each shop  |
| `GET` | `/api/v1/statistics/popular-shops` | Get top 3 massage shops by number of reservations |