import { AuthController } from "../controllers/authController";
import { ImageController } from "../controllers/imageController";
import { ImageRepository } from "../repositories/image.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { ImageService } from "../services/image.service";

const userRepository = new UserRepository()
const authService = new AuthService(userRepository);
const authController = new AuthController(authService)

const imageRepository = new ImageRepository();
const imageService = new ImageService(imageRepository);
const imageController = new ImageController(imageService)

export {
    userRepository,
    authService,
    authController,
    imageRepository,
    imageService,
    imageController
}