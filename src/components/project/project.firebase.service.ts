import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Project } from "../../model/project.model";
import { Firestore, addDoc, collection, collectionData, doc, getDoc, setDoc } from "@angular/fire/firestore";
import { Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProjectFirebaseService {
    // firestore = Inject(Firestore)


    constructor(private fireStore: Firestore) { }

    saveProject(project: Project) {
        const collectionInstance = collection(this.fireStore, 'projects');
        return addDoc(collectionInstance, project)
    }

    getProjects() {
        const collectionInstance = collection(this.fireStore, 'projects');
        return collectionData(collectionInstance, {
            idField: 'id',
        });
    }

    getProjectById(id: string) {
        const docRef = doc(this.fireStore, 'projects', id)
        return getDoc(docRef);
    }

    updateProject(projectId: string, dataToUpdate: Project) {
        const docRef = doc(this.fireStore, 'projects', projectId)
        return setDoc(docRef, dataToUpdate);
    }

}