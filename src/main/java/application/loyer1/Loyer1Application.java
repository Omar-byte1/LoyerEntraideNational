package application.loyer1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Loyer1Application {

	public static void main(String[] args) {
		SpringApplication.run(Loyer1Application.class, args);
	}

}
