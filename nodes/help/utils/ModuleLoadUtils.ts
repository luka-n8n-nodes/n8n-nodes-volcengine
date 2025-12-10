import { globSync } from 'glob';
import path from 'path';

class ModuleLoadUtils {
	static loadModules(dirPath: string, expression: string) {
		const files = globSync(expression, {
			cwd: dirPath,
		});

		const modules = [];
		for (const file of files) {
			const fullpath = path.resolve(dirPath, file);
			const filepath = path.relative(__dirname, fullpath);
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const module = require(filepath);
			modules.push({
				order: 100,
				...module.default,
			});
		}

		return modules;
	}
}

export default ModuleLoadUtils;

